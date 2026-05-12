import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCartStore, useAuthStore, useOrdersStore } from '../store/index';
import { useTheme } from '../theme/ThemeProvider';
import { apiService, Product } from '../services/apiService';
import TabBar from '../components/TabBar';

function money(v: number) { return `₦${(v || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`; }

// ─── PRODUCT DETAILS ───────────────────────────────────────────────────────────
export function ProductDetailsPage() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addItem, items } = useCartStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiService.getProduct(id).then(res => {
      if (res.success && res.data) {
        const p = res.data;
        setProduct({ ...p, price: p.sellingPrice || p.price, image: p.imageUrl || p.image || '' });
      }
      setLoading(false);
    });
  }, [id]);

  const cartQty = items.find(i => i.id === id)?.quantity || 0;

  const addToCart = () => {
    if (!product) return;
    for (let i = 0; i < qty; i++) addItem({ id: product.id, name: product.name, price: product.price, image: product.image });
    setToast('Added to cart!');
    setTimeout(() => setToast(''), 2000);
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', background: colors.bg }}><div className="spinner" /></div>;
  if (!product) return <div className="empty-state"><h3 style={{ color: colors.text }}>Product not found</h3><button className="btn btn-primary" onClick={() => navigate('/products')}>Browse Products</button></div>;

  const isOut = !product.inStock || (product.stockCount || 0) === 0;
  const stockPct = Math.min(100, ((product.stockCount || 0) / 50) * 100);

  return (
    <div className="screen-content no-tab page-enter" style={{ background: colors.bg }}>
      <div className="header" style={{ background: colors.card, borderColor: colors.border }}>
        <button onClick={() => navigate(-1)} className="header-back"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5m7-7l-7 7 7 7"/></svg></button>
        <span className="header-title" style={{ color: colors.text }}>Product Details</span>
        <button onClick={() => navigate('/cart')} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
          {cartQty > 0 && <span className="badge" style={{ position: 'absolute', top: -6, right: -6, fontSize: 9 }}>{cartQty}</span>}
        </button>
      </div>

      <div style={{ width: '100%', aspectRatio: '1', background: colors.muted, overflow: 'hidden', maxHeight: 280 }}>
        {product.image ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={colors.border} strokeWidth="1"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 2H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          </div>
        )}
      </div>

      <div style={{ padding: '20px 16px', background: colors.card, marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 20, color: colors.text, lineHeight: 1.3 }}>{product.name}</h2>
            {product.subtitle && <p style={{ color: colors.sub, marginTop: 4, fontSize: 14 }}>{product.subtitle}</p>}
          </div>
          {isOut ? <span className="status-badge status-cancelled">Out of Stock</span> : <span className="status-badge status-delivered">In Stock</span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
          <span style={{ fontFamily: 'Sora,sans-serif', fontWeight: 900, fontSize: 26, color: colors.text }}>{money(product.price)}</span>
          {product.compareAtPrice && <span style={{ color: colors.sub, textDecoration: 'line-through', fontSize: 16 }}>{money(product.compareAtPrice)}</span>}
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span style={{ background: colors.brandLight, color: colors.brand, padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 800 }}>
              {Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF
            </span>
          )}
        </div>

        {product.tags && product.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            {product.tags.map(tag => <span key={tag} style={{ background: colors.muted, color: colors.sub, padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{tag}</span>)}
          </div>
        )}
      </div>

      {product.description && (
        <div style={{ padding: '16px', background: colors.card, marginBottom: 8 }}>
          <h3 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16, color: colors.text, marginBottom: 8 }}>Description</h3>
          <p style={{ color: colors.sub, lineHeight: 1.7, fontSize: 14 }}>{product.description}</p>
        </div>
      )}

      {!isOut && (
        <div style={{ padding: '16px', background: colors.card, marginBottom: 8 }}>
          <h3 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16, color: colors.text, marginBottom: 12 }}>Quantity</h3>
          <div className="qty-control">
            <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} style={{ background: colors.muted, borderColor: colors.border }}>−</button>
            <span style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 18, color: colors.text, minWidth: 32, textAlign: 'center' }}>{qty}</span>
            <button className="qty-btn" onClick={() => setQty(q => q + 1)} style={{ background: colors.muted, borderColor: colors.border }}>+</button>
            <span style={{ color: colors.sub, fontSize: 13, marginLeft: 8 }}>{product.stockCount ? `${product.stockCount} available` : ''}</span>
          </div>
        </div>
      )}

      <div style={{ padding: 16, display: 'flex', gap: 12 }}>
        <button className="btn btn-ghost" style={{ flex: 1, borderColor: colors.border }} onClick={() => navigate('/cart')}>View Cart</button>
        <button className={`btn btn-primary${isOut ? ' disabled' : ''}`} style={{ flex: 2 }} onClick={addToCart} disabled={isOut}>
          {isOut ? 'Out of Stock' : `Add to Cart • ${money(product.price * qty)}`}
        </button>
      </div>

      {toast && (
        <div className="toast-enter" style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#059669', color: '#fff', padding: '10px 20px', borderRadius: 12, fontWeight: 700, fontSize: 14, zIndex: 300 }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}

// ─── CART PAGE ─────────────────────────────────────────────────────────────────
export function CartPage() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, totalPrice, discountAmount, appliedCouponCode, removeCoupon, getGrandTotal } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const grandTotal = getGrandTotal();

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true); setCouponError('');
    const res = await apiService.validateCoupon(couponCode.trim(), totalPrice);
    setCouponLoading(false);
    if (res.success && res.data?.valid) {
      useCartStore.getState().applyCoupon(couponCode.trim(), res.data.discountAmount);
      setCouponCode('');
    } else setCouponError(res.data?.message || res.message || 'Invalid coupon');
  };

  return (
    <>
      <div className="screen-content page-enter" style={{ background: colors.bg }}>
        <div className="header" style={{ background: colors.card, borderColor: colors.border }}>
          <span className="header-title" style={{ color: colors.text }}>My Cart</span>
          {items.length > 0 && <button onClick={clearCart} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontWeight: 700, fontSize: 13 }}>Clear All</button>}
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
            <h3 style={{ color: colors.text }}>Your cart is empty</h3>
            <p style={{ color: colors.sub }}>Add some products to get started</p>
            <button className="btn btn-primary" onClick={() => navigate('/products')}>Browse Products</button>
          </div>
        ) : (
          <>
            {items.map(item => (
              <div key={item.id} className="cart-item" style={{ borderColor: colors.border }}>
                {item.image ? <img src={item.image} alt={item.name} className="cart-item-img" /> : <div className="cart-item-img" style={{ background: colors.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.sub} strokeWidth="1.5"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4"/></svg></div>}
                <div className="cart-item-info">
                  <div style={{ fontWeight: 700, fontSize: 14, color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                  <div style={{ color: colors.brand, fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 15, marginTop: 4 }}>{money(item.price)}</div>
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: colors.muted, borderColor: colors.border }}>−</button>
                    <span style={{ fontWeight: 700, color: colors.text }}>{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: colors.muted, borderColor: colors.border }}>+</button>
                    <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', marginLeft: 8, fontSize: 12, fontWeight: 700 }}>Remove</button>
                  </div>
                </div>
                <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 15, color: colors.text, flexShrink: 0 }}>{money(item.price * item.quantity)}</div>
              </div>
            ))}

            <div style={{ padding: '16px', background: colors.card, margin: '12px 16px', borderRadius: 16, border: `1px solid ${colors.border}` }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input" placeholder="Coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value)} style={{ background: colors.muted, borderColor: colors.border, color: colors.text, flex: 1 }} />
                <button className="btn btn-primary" style={{ padding: '12px 16px', fontSize: 14 }} onClick={applyCoupon} disabled={couponLoading}>
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </div>
              {couponError && <p style={{ color: '#EF4444', fontSize: 13, marginTop: 8 }}>{couponError}</p>}
              {appliedCouponCode && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, background: colors.brandLight, padding: '8px 12px', borderRadius: 10 }}>
                <span style={{ color: colors.brand, fontWeight: 700, fontSize: 13 }}>✓ Coupon "{appliedCouponCode}" applied!</span>
                <button onClick={removeCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: 12, fontWeight: 700 }}>Remove</button>
              </div>}
            </div>

            <div style={{ padding: '16px', background: colors.card, margin: '0 16px 16px', borderRadius: 16, border: `1px solid ${colors.border}` }}>
              <h3 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 16, color: colors.text, marginBottom: 14 }}>Order Summary</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: colors.sub }}>Subtotal</span>
                <span style={{ fontWeight: 700, color: colors.text }}>{money(totalPrice)}</span>
              </div>
              {discountAmount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: colors.sub }}>Discount</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>-{money(discountAmount)}</span>
              </div>}
              <div className="divider" style={{ background: colors.border }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, color: colors.text }}>Total</span>
                <span style={{ fontFamily: 'Sora,sans-serif', fontWeight: 900, fontSize: 20, color: colors.brand }}>{money(grandTotal)}</span>
              </div>
              <button className="btn btn-primary btn-full" style={{ marginTop: 16 }} onClick={() => navigate('/checkout')}>Proceed to Checkout →</button>
            </div>
          </>
        )}
      </div>
      <TabBar />
    </>
  );
}

// ─── CHECKOUT PAGE ─────────────────────────────────────────────────────────────
export function CheckoutPage() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { items, totalPrice, getGrandTotal, clearCart, appliedCouponCode, discountAmount } = useCartStore();
  const { user } = useAuthStore();
  const { createOrder } = useOrdersStore();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<any>(null);
  const [deliveryMode, setDeliveryMode] = useState<'home' | 'pickup'>('home');
  const [payMethod, setPayMethod] = useState('cash_on_delivery');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiService.getCustomerAddresses().then(res => {
      if (res.success && res.data) {
        setAddresses(res.data);
        const def = res.data.find(a => a.is_default) || res.data[0];
        if (def) setSelectedAddr(def);
      }
    });
  }, []);

  const grandTotal = getGrandTotal();

  const placeOrder = async () => {
    if (deliveryMode === 'home' && !selectedAddr) { setError('Please select a delivery address'); return; }
    setLoading(true); setError('');
    const orderItems = items.map(i => ({ product_id: i.id, quantity: i.quantity, price: i.price }));
    const res = await createOrder({
      items: orderItems,
      delivery_address_id: deliveryMode === 'home' ? selectedAddr?.id : undefined,
      delivery_mode: deliveryMode,
      payment_method: payMethod,
      ...(appliedCouponCode && { couponCode: appliedCouponCode }),
    });
    setLoading(false);
    if (res.success) {
      clearCart();
      navigate('/order-confirmation', { state: { order: res.data } });
    } else setError(res.message || 'Failed to place order');
  };

  if (!items.length) { navigate('/cart'); return null; }

  return (
    <div className="screen-content no-tab page-enter" style={{ background: colors.bg }}>
      <div className="header" style={{ background: colors.card, borderColor: colors.border }}>
        <button onClick={() => navigate(-1)} className="header-back"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5m7-7l-7 7 7 7"/></svg></button>
        <span className="header-title" style={{ color: colors.text }}>Checkout</span>
        <div style={{ width: 32 }} />
      </div>

      <div style={{ padding: '0 16px', paddingBottom: 120 }}>
        {error && <div style={{ background: '#FEE2E2', borderRadius: 12, padding: '12px 16px', color: '#DC2626', margin: '16px 0', fontWeight: 600 }}>{error}</div>}

        {/* Delivery Mode */}
        <h3 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, marginTop: 20, marginBottom: 12, color: colors.text }}>Delivery Mode</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {(['home', 'pickup'] as const).map(mode => (
            <button key={mode} onClick={() => setDeliveryMode(mode)} style={{ padding: '16px', border: `2px solid ${deliveryMode === mode ? colors.brand : colors.border}`, borderRadius: 14, background: deliveryMode === mode ? colors.brandLight : colors.card, cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{mode === 'home' ? '🚚' : '🏪'}</div>
              <div style={{ fontWeight: 700, color: deliveryMode === mode ? colors.brand : colors.text, fontSize: 14, textTransform: 'capitalize' }}>{mode === 'home' ? 'Home Delivery' : 'Pickup'}</div>
            </button>
          ))}
        </div>

        {/* Address */}
        {deliveryMode === 'home' && (
          <>
            <h3 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, marginTop: 24, marginBottom: 12, color: colors.text }}>Delivery Address</h3>
            {addresses.length === 0 ? (
              <div style={{ background: colors.muted, borderRadius: 14, padding: 16, color: colors.sub, fontSize: 14 }}>
                No addresses saved. <button onClick={() => navigate('/profile/addresses')} style={{ color: colors.brand, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Add one →</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {addresses.map(addr => (
                  <div key={addr.id} onClick={() => setSelectedAddr(addr)} style={{ padding: '14px', border: `2px solid ${selectedAddr?.id === addr.id ? colors.brand : colors.border}`, borderRadius: 14, background: selectedAddr?.id === addr.id ? colors.brandLight : colors.card, cursor: 'pointer' }}>
                    <div style={{ fontWeight: 700, color: colors.text, fontSize: 14 }}>{addr.label} {addr.is_default && <span style={{ background: colors.brandLight, color: colors.brand, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>Default</span>}</div>
                    <div style={{ color: colors.sub, fontSize: 13, marginTop: 4 }}>{addr.street}, {addr.city}, {addr.state}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Payment */}
        <h3 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, marginTop: 24, marginBottom: 12, color: colors.text }}>Payment Method</h3>
        <div style={{ border: `2px solid ${colors.brand}`, borderRadius: 14, padding: '14px', background: colors.brandLight }}>
          <span style={{ fontWeight: 700, color: colors.brand }}>💵 Cash on Delivery</span>
        </div>

        {/* Summary */}
        <h3 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, marginTop: 24, marginBottom: 12, color: colors.text }}>Order Summary</h3>
        <div style={{ background: colors.card, borderRadius: 14, border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${colors.border}` }}>
              <span style={{ color: colors.text, fontSize: 14, flex: 1, marginRight: 8 }}>{item.name} × {item.quantity}</span>
              <span style={{ fontWeight: 700, color: colors.text, fontSize: 14 }}>{money(item.price * item.quantity)}</span>
            </div>
          ))}
          {discountAmount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${colors.border}` }}>
            <span style={{ color: '#059669' }}>Discount ({appliedCouponCode})</span>
            <span style={{ fontWeight: 700, color: '#059669' }}>-{money(discountAmount)}</span>
          </div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px' }}>
            <span style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, color: colors.text }}>Total</span>
            <span style={{ fontFamily: 'Sora,sans-serif', fontWeight: 900, fontSize: 20, color: colors.brand }}>{money(grandTotal)}</span>
          </div>
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: 16, background: colors.card, borderTop: `1px solid ${colors.border}` }}>
        <button className="btn btn-primary btn-full" onClick={placeOrder} disabled={loading || (deliveryMode === 'home' && !selectedAddr)}>
          {loading ? 'Placing Order...' : `Place Order • ${money(grandTotal)}`}
        </button>
      </div>
    </div>
  );
}

// ─── ORDER CONFIRMATION ────────────────────────────────────────────────────────
export function OrderConfirmationPage() {
  const { colors } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="screen-content no-tab" style={{ background: colors.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px', gap: 20 }}>
      <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
      </div>
      <h2 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 900, fontSize: 24, color: colors.text, textAlign: 'center' }}>Order Placed! 🎉</h2>
      <p style={{ color: colors.sub, textAlign: 'center', lineHeight: 1.7, fontSize: 15 }}>Your order has been successfully placed. We'll notify you when it's on its way!</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', marginTop: 12 }}>
        <button className="btn btn-primary btn-full" onClick={() => navigate('/orders')}>Track My Order</button>
        <button className="btn btn-ghost btn-full" onClick={() => navigate('/')}>Continue Shopping</button>
      </div>
    </div>
  );
}

// ─── ORDERS PAGE ───────────────────────────────────────────────────────────────
export function OrdersPage() {
  const { colors } = useTheme();
  const { orders, loading, fetchOrders } = useOrdersStore();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchOrders(); }, []);

  const statusClass = (s: string) => {
    if (!s) return 'status-badge';
    if (['pending', 'preparing'].includes(s.toLowerCase())) return 'status-badge status-pending';
    if (['confirmed', 'in_transit', 'out_for_delivery'].includes(s.toLowerCase())) return 'status-badge status-confirmed';
    if (s.toLowerCase() === 'delivered') return 'status-badge status-delivered';
    if (s.toLowerCase() === 'cancelled') return 'status-badge status-cancelled';
    return 'status-badge';
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

  return (
    <>
      <div className="screen-content page-enter" style={{ background: colors.bg }}>
        <div className="header" style={{ background: colors.card, borderColor: colors.border }}>
          <span className="header-title" style={{ color: colors.text }}>My Orders</span>
        </div>

        {loading ? (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[...Array(4)].map((_, i) => <div key={i} style={{ background: colors.card, borderRadius: 14, padding: 16, border: `1px solid ${colors.border}` }}>
              <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 14, width: '40%' }} />
            </div>)}
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/></svg>
            <h3 style={{ color: colors.text }}>No orders yet</h3>
            <p style={{ color: colors.sub }}>Start shopping to see your orders here</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Shop Now</button>
          </div>
        ) : (
          <div style={{ padding: '12px 0' }}>
            {orders.map(order => (
              <div key={order.id} className="order-card" style={{ background: colors.card, borderColor: colors.border }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 15, color: colors.text }}>#{order.order_number || order.id?.slice(0, 8)}</div>
                    <div style={{ color: colors.sub, fontSize: 13, marginTop: 3 }}>{formatDate(order.created_at || order.createdAt)}</div>
                  </div>
                  <span className={statusClass(order.status)} style={{ fontSize: 11 }}>{order.status?.replace(/_/g, ' ')}</span>
                </div>
                <div className="divider" style={{ background: colors.border, margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: colors.sub, fontSize: 13 }}>{Array.isArray(order.items) ? order.items.length : 0} item{Array.isArray(order.items) && order.items.length !== 1 ? 's' : ''}</span>
                  <span style={{ fontFamily: 'Sora,sans-serif', fontWeight: 900, fontSize: 16, color: colors.brand }}>{money(order.total_amount || order.totalAmountNaira || 0)}</span>
                </div>
                <div style={{ marginTop: 12 }}>
                  <button onClick={() => navigate('/support')} style={{ background: 'none', border: `1.5px solid ${colors.border}`, borderRadius: 10, padding: '8px 16px', cursor: 'pointer', color: colors.text, fontWeight: 700, fontSize: 13 }}>Get Support</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <TabBar />
    </>
  );
}
