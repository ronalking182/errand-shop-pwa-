import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService, User, Product } from '../services/apiService';

// ─── AUTH STORE ────────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { first_name: string; last_name: string; email: string; password: string; phone: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  loadUser: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  loadUser: () => {
    const user = apiService.getCurrentUser();
    const isLoggedIn = apiService.isLoggedIn();
    set({ user, isAuthenticated: isLoggedIn && !!user });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    const res = await apiService.login(email, password);
    if (res.success && res.data) {
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
      return true;
    }
    set({ error: res.message || 'Login failed', isLoading: false });
    return false;
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    const res = await apiService.register(data);
    if (res.success) { set({ isLoading: false }); return true; }
    set({ error: res.message || 'Registration failed', isLoading: false });
    return false;
  },

  logout: async () => {
    await apiService.logout();
    set({ user: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));

// ─── CART STORE ────────────────────────────────────────────────────────────────
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  appliedCouponCode?: string;
  discountAmount: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  getGrandTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      totalPrice: 0,
      discountAmount: 0,

      addItem: (item) => {
        const { items } = get();
        const existing = items.find(i => i.id === item.id);
        if (existing) {
          set(s => ({
            items: s.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i),
            itemCount: s.itemCount + 1,
            totalPrice: s.totalPrice + item.price,
          }));
        } else {
          set(s => ({
            items: [...s.items, { ...item, quantity: 1 }],
            itemCount: s.itemCount + 1,
            totalPrice: s.totalPrice + item.price,
          }));
        }
      },

      removeItem: (id) => {
        const item = get().items.find(i => i.id === id);
        if (item) {
          set(s => ({
            items: s.items.filter(i => i.id !== id),
            itemCount: s.itemCount - item.quantity,
            totalPrice: s.totalPrice - item.price * item.quantity,
          }));
        }
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) { get().removeItem(id); return; }
        const item = get().items.find(i => i.id === id);
        if (item) {
          const diff = quantity - item.quantity;
          set(s => ({
            items: s.items.map(i => i.id === id ? { ...i, quantity } : i),
            itemCount: s.itemCount + diff,
            totalPrice: s.totalPrice + item.price * diff,
          }));
        }
      },

      clearCart: () => set({ items: [], itemCount: 0, totalPrice: 0, appliedCouponCode: undefined, discountAmount: 0 }),
      applyCoupon: (code, discount) => set({ appliedCouponCode: code, discountAmount: discount }),
      removeCoupon: () => set({ appliedCouponCode: undefined, discountAmount: 0 }),
      getGrandTotal: () => Math.max(0, get().totalPrice - get().discountAmount),
    }),
    { name: 'errand-cart' }
  )
);

// ─── PRODUCT STORE ─────────────────────────────────────────────────────────────
interface ProductState {
  products: Product[];
  categories: string[];
  loading: boolean;
  error: string | null;
  fetchProducts: (params?: { search?: string; category?: string }) => Promise<void>;
  fetchCategories: () => Promise<void>;
}

export const useProductStore = create<ProductState>()((set) => ({
  products: [],
  categories: [],
  loading: false,
  error: null,

  fetchProducts: async (params) => {
    set({ loading: true, error: null });
    const res = await apiService.getProducts(params);
    if (res.success && res.data) {
      const raw = res.data.data || (res.data as any);
      const products = Array.isArray(raw) ? raw : [];
      set({ products: products.map(normalizeProduct), loading: false });
    } else {
      set({ error: res.message || 'Failed', loading: false });
    }
  },

  fetchCategories: async () => {
    const res = await apiService.getCategories();
    if (res.success && res.data) set({ categories: Array.isArray(res.data) ? res.data : [] });
  },
}));

function normalizeProduct(p: any): Product {
  return {
    ...p,
    price: typeof p.sellingPrice === 'number' ? p.sellingPrice : (typeof p.price === 'number' ? p.price : 0),
    subtitle: p.subtitle || p.unit || '',
    image: p.imageUrl || p.image || '',
    inStock: p.inStock !== undefined ? p.inStock : (p.isActive !== false && (p.stockQuantity || p.stockCount || 0) > 0),
    stockCount: p.stockQuantity || p.stockCount || 0,
    tags: Array.isArray(p.tags) ? p.tags : [],
    rating: typeof p.rating === 'number' ? p.rating : 0,
    reviewCount: typeof p.reviewCount === 'number' ? p.reviewCount : 0,
  };
}

// ─── ORDERS STORE ──────────────────────────────────────────────────────────────
interface OrdersState {
  orders: any[];
  loading: boolean;
  fetchOrders: () => Promise<void>;
  createOrder: (data: any) => Promise<any>;
}

export const useOrdersStore = create<OrdersState>()((set) => ({
  orders: [],
  loading: false,

  fetchOrders: async () => {
    set({ loading: true });
    const res = await apiService.getOrders();
    set({ orders: res.success ? (res.data || []) : [], loading: false });
  },

  createOrder: async (data) => {
    const res = await apiService.createOrder(data);
    return res;
  },
}));
