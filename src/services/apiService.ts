import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL || 'https://errand-shop-backend.onrender.com') + '/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  phone?: string;
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  subtitle?: string;
  description: string;
  price: number;
  sellingPrice?: number;
  compareAtPrice?: number;
  stockCount?: number;
  stockQuantity?: number;
  imageUrl?: string;
  image?: string;
  category: string;
  tags: string[];
  inStock?: boolean;
  isActive?: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  totalAmountNaira?: number;
  items: { product_id: string; quantity: number; price: number }[];
  delivery_address?: Address;
  delivery_mode?: 'home' | 'pickup';
  payment_method: string;
  created_at: string;
}

export interface Address {
  id: string;
  label: string;
  type: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  is_default: boolean;
}

export interface CustomerProfile {
  id: number;
  userId?: number;
  firstName: string;
  lastName: string;
  phone: string;
  gender?: string;
  avatar?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

function getToken() { return localStorage.getItem('accessToken'); }
function getRefreshToken() { return localStorage.getItem('refreshToken'); }

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });

    this.api.interceptors.request.use(async (config) => {
      const token = getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    this.api.interceptors.response.use(
      (res) => res,
      async (error) => {
        const orig = error.config;
        if (error.response?.status === 401 && !orig._retry) {
          orig._retry = true;
          try {
            const rt = getRefreshToken();
            if (!rt) throw new Error('No refresh token');
            const res = await this.api.post('/auth/refresh-token', { refresh_token: rt });
            if (res.data.success && res.data.data) {
              localStorage.setItem('accessToken', res.data.data.token);
              localStorage.setItem('refreshToken', res.data.data.refreshToken);
              orig.headers.Authorization = `Bearer ${res.data.data.token}`;
              return this.api(orig);
            }
          } catch {
            this.clearTokens();
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
  }

  async login(identifier: string, password: string): Promise<ApiResponse<{ token: string; refreshToken: string; user: User }>> {
    try {
      const isEmail = identifier.includes('@');
      const body = isEmail ? { email: identifier, password } : { phone: identifier, password };
      const res = await this.api.post('/auth/login', body);
      if (res.data.success && res.data.data) {
        const { token, refreshToken, user } = res.data.data;
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userData', JSON.stringify(user));
      }
      return res.data;
    } catch (e: any) {
      return { success: false, message: e.response?.data?.message || 'Login failed' };
    }
  }

  async register(userData: { first_name: string; last_name: string; email: string; password: string; phone: string }): Promise<ApiResponse> {
    try {
      const res = await this.api.post('/auth/register', {
        name: `${userData.first_name} ${userData.last_name}`,
        email: userData.email, password: userData.password, phone: userData.phone,
        first_name: userData.first_name, last_name: userData.last_name, role: 'customer',
      });
      return res.data;
    } catch (e: any) {
      if (!e.response) {
        if (e.code === 'ECONNABORTED' || e.message?.includes('timeout')) {
          return { success: false, message: 'Connection timed out. The server may be starting up — please wait a moment and try again.' };
        }
        return { success: false, message: 'Cannot reach the server. Please check your internet connection and try again.' };
      }
      const status: number = e.response.status;
      const data = e.response.data;
      let backendMessage: string = data?.message || data?.error || data?.detail || '';
      if (Array.isArray(data?.errors) && data.errors.length > 0) {
        backendMessage = data.errors.map((err: any) => err.message || err.msg || String(err)).join(' • ');
      } else if (data?.errors && typeof data.errors === 'object') {
        backendMessage = Object.values(data.errors).flat().join(' • ');
      }
      if (status === 409) {
        return { success: false, message: backendMessage || 'An account with this email or phone number already exists. Please log in instead.' };
      }
      if (status === 400 || status === 422) {
        return { success: false, message: backendMessage || 'Some of your details are invalid. Please check the form and try again.' };
      }
      if (status === 429) {
        return { success: false, message: 'Too many attempts. Please wait a few minutes and try again.' };
      }
      if (status >= 500) {
        return { success: false, message: `Server error (${status}): Our servers are having trouble right now. Please try again in a moment.` };
      }
      return { success: false, message: backendMessage || `Registration failed (error ${status}). Please try again.` };
    }
  }

  async verifyEmail(code: string): Promise<ApiResponse> {
    try { const res = await this.api.post('/auth/verify-email', { code }); return res.data; }
    catch (e: any) { return { success: false, message: e.response?.data?.message || 'Verification failed' }; }
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    try { const res = await this.api.post('/auth/forgot-password', { email }); return res.data; }
    catch (e: any) { return { success: false, message: e.response?.data?.message || 'Failed' }; }
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<ApiResponse> {
    try { const res = await this.api.post('/auth/reset-password', { email, otp: code, newPassword }); return res.data; }
    catch (e: any) {
      const data = e.response?.data;
      let msg = data?.message || 'Reset failed';
      if (Array.isArray(data?.errors) && data.errors.length > 0) {
        msg = data.errors.map((err: any) => err.message || err.msg || String(err)).join(' • ');
      }
      return { success: false, message: msg };
    }
  }

  async logout(): Promise<void> {
    try { await this.api.post('/auth/logout'); } catch {}
    this.clearTokens();
  }

  async getProducts(params?: { page?: number; limit?: number; search?: string; category?: string }): Promise<ApiResponse<{ data: Product[]; pagination: any }>> {
    try {
      const res = await this.api.get('/products', { params: { page: params?.page || 1, limit: params?.limit || 20, q: params?.search || '', category: params?.category } });
      return res.data;
    } catch (e: any) { return { success: false, message: e.response?.data?.message || 'Failed to fetch products' }; }
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    try { const res = await this.api.get(`/products/${id}`); return res.data; }
    catch (e: any) { return { success: false, message: e.response?.data?.message || 'Failed' }; }
  }

  async getCategories(): Promise<ApiResponse<string[]>> {
    try { const res = await this.api.get('/categories'); return res.data; }
    catch (e: any) { return { success: false, message: 'Failed' }; }
  }

  async getOrders(): Promise<ApiResponse<Order[]>> {
    try {
      const res = await this.api.get('/orders?page=1&limit=20');
      const d = res.data.data?.data || res.data.data || res.data;
      return { success: true, data: Array.isArray(d) ? d : [] };
    } catch (e: any) { return { success: false, message: e.response?.data?.message || 'Failed' }; }
  }

  async createOrder(orderData: any): Promise<ApiResponse<Order>> {
    try {
      const idempotencyKey = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
      const body = {
        ...orderData, IdempotencyKey: idempotencyKey,
        items: orderData.items.map((i: any) => ({ ProductID: i.product_id, quantity: i.quantity, price: i.price })),
      };
      const res = await this.api.post('/orders', body);
      return { success: true, data: res.data };
    } catch (e: any) { return { success: false, message: e.response?.data?.message || 'Failed to create order' }; }
  }

  async getCustomerProfile(): Promise<ApiResponse<CustomerProfile>> {
    try {
      const res = await this.api.get('/customers/profile');
      const d = res.data.data || res.data;
      return { success: true, data: { id: d.id, userId: d.user_id, firstName: d.first_name || '', lastName: d.last_name || '', phone: d.phone || '', gender: d.gender || '', avatar: d.avatar || '', status: d.status || 'active', createdAt: d.created_at, updatedAt: d.updated_at } };
    } catch (e: any) { return { success: false, message: e.response?.data?.message || 'Failed' }; }
  }

  async updateCustomerProfile(data: { firstName: string; lastName: string; phone: string; gender?: string; avatar?: string }): Promise<ApiResponse<CustomerProfile>> {
    try {
      const body: any = { first_name: data.firstName.trim(), last_name: data.lastName.trim(), phone: data.phone?.trim() || '' };
      if (data.gender) body.gender = data.gender;
      if (data.avatar) body.avatar = data.avatar;
      const res = await this.api.put('/customers/profile', body);
      const d = res.data.data || res.data;
      return { success: true, data: { id: d.id, userId: d.user_id, firstName: d.first_name || '', lastName: d.last_name || '', phone: d.phone || '', gender: d.gender || '', avatar: d.avatar || '', status: d.status || 'active', createdAt: d.created_at, updatedAt: d.updated_at } };
    } catch (e: any) { return { success: false, message: e.response?.data?.message || 'Failed' }; }
  }

  async getCustomerAddresses(): Promise<ApiResponse<Address[]>> {
    try {
      const res = await this.api.get('/customers/addresses');
      const d = res.data.data || res.data;
      return { success: true, data: Array.isArray(d) ? d : [] };
    } catch (e: any) { return { success: false, message: e.response?.data?.message || 'Failed' }; }
  }

  async createCustomerAddress(data: Omit<Address, 'id'>): Promise<ApiResponse<Address>> {
    try { const res = await this.api.post('/customers/addresses', data); return { success: true, data: res.data }; }
    catch (e: any) { return { success: false, message: e.response?.data?.message || 'Failed' }; }
  }

  async deleteCustomerAddress(id: string): Promise<ApiResponse> {
    try { await this.api.delete(`/customers/addresses/${id}`); return { success: true }; }
    catch (e: any) { return { success: false, message: e.response?.data?.message || 'Failed' }; }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    try { const res = await this.api.post('/auth/password/change', { currentPassword, newPassword }); return { success: true, data: res.data }; }
    catch (e: any) { return { success: false, message: e.response?.data?.message || 'Failed' }; }
  }

  async getCustomRequests(): Promise<ApiResponse<any[]>> {
    try {
      const res = await this.api.get('/custom-requests');
      const d = res.data.data || res.data;
      return { success: true, data: Array.isArray(d) ? d : [] };
    } catch (e: any) { return { success: false, message: e.response?.data?.message || 'Failed' }; }
  }

  async createCustomRequest(data: { title: string; description: string; quantity?: number; unit?: string; preferredBrand?: string }): Promise<ApiResponse> {
    try {
      const body = { items: [{ name: data.title, description: data.description, quantity: data.quantity || 1, unit: data.unit || 'piece', preferredBrand: data.preferredBrand }], priority: 'MEDIUM', allowSubstitutions: true };
      const res = await this.api.post('/custom-requests', body);
      return { success: true, data: res.data };
    } catch (e: any) { return { success: false, message: e.response?.data?.message || 'Failed' }; }
  }

  async getAvailableCoupons(): Promise<ApiResponse<any[]>> {
    try {
      const res = await this.api.get('/user/coupons/available');
      const d = res.data.data || res.data;
      return { success: true, data: Array.isArray(d) ? d : [] };
    } catch (e: any) { return { success: false, message: 'Failed' }; }
  }

  async validateCoupon(code: string, orderAmount: number): Promise<ApiResponse<{ valid: boolean; discountAmount: number; message: string }>> {
    try {
      const res = await this.api.post('/user/coupons/validate', { code, orderAmount: Math.round(orderAmount * 100) });
      return { success: true, data: res.data.data || res.data };
    } catch (e: any) { return { success: false, message: e.response?.data?.message || 'Invalid coupon' }; }
  }

  async getChatRooms(): Promise<ApiResponse<any[]>> {
    try {
      const res = await this.api.get('/chat/rooms');
      if (res.data?.status === 'success') return { success: true, data: res.data.data?.rooms || [] };
      return { success: false, message: 'Failed' };
    } catch (e: any) { return { success: false, message: 'Failed' }; }
  }

  async getChatMessages(roomId: string): Promise<ApiResponse<any[]>> {
    try {
      const res = await this.api.get(`/chat/rooms/${roomId}/messages`);
      const body = res.data;
      const inner = body?.data ?? body;
      const list = Array.isArray(inner?.messages)
        ? inner.messages
        : Array.isArray(inner)
          ? inner
          : [];
      return { success: true, data: list };
    } catch (e: any) {
      return { success: false, message: 'Failed' };
    }
  }

  async createChatRoom(data: { customer_id: number; subject: string; message: string }): Promise<ApiResponse<any>> {
    try { const res = await this.api.post('/chat/rooms', data); return res.data; }
    catch (e: any) { return { success: false, message: 'Failed' }; }
  }

  async sendMessage(data: {
    chatRoomId: string;
    message: string;
    senderId: string;
    senderType: string;
  }): Promise<ApiResponse> {
    try {
      const res = await this.api.post('/chat/messages', {
        room_id: Number(data.chatRoomId),
        message: data.message,
      });
      return res.data;
    } catch (e: any) {
      return { success: false, message: 'Failed' };
    }
  }

  getCurrentUser(): User | null {
    const d = localStorage.getItem('userData');
    return d ? JSON.parse(d) : null;
  }

  isLoggedIn(): boolean { return !!getToken(); }
}

export const apiService = new ApiService();
