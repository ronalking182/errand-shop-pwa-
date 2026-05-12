import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TabBar from '../components/TabBar';
import { useProductStore, useCartStore, useAuthStore } from '../store/index';
import { useTheme } from '../theme/ThemeProvider';
import { Product } from '../services/apiService';

function money(v: number) {
  return `₦${v.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  const navigate = useNavigate();
  const isOut = !product.inStock || (product.stockCount || 0) === 0;
  const isLow = !isOut && (product.stockCount || 0) <= 5;

  return (
    <div className="product-card" onClick={() => navigate(`/products/${product.id}`)}>
      <div className="product-thumb">
        {product.image ? (
          <img src={product.image} alt={product.name} loading="lazy" />
        ) : (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.5"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
        )}
        {isOut && <span className="stock-badge" style={{ background: '#EF4444' }}>Out of Stock</span>}
        {!isOut && isLow && <span className="stock-badge" style={{ background: '#F59E0B' }}>Low Stock</span>}
        {product.tags?.includes('Sale') && <span className="sale-tag">Sale</span>}
      </div>
      <div className="product-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
      {product.subtitle && <div className="product-sub">{product.subtitle}</div>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
        <div>
          <div className="product-price">{money(product.price)}</div>
          {product.compareAtPrice && <div className="product-compare">{money(product.compareAtPrice)}</div>}
        </div>
        <button
          className={`add-btn${isOut ? ' disabled' : ''}`}
          onClick={e => { e.stopPropagation(); if (!isOut) onAdd(); }}
          aria-label="Add to cart"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { products, categories, loading, fetchProducts, fetchCategories } = useProductStore();
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const [q, setQ] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    const params: any = {};
    if (activeCategory !== 'All') params.category = activeCategory;
    if (q.trim()) params.search = q.trim();
    const timer = setTimeout(() => fetchProducts(params), 300);
    return () => clearTimeout(timer);
  }, [q, activeCategory]);

  const allCategories = useMemo(() => {
    if (categories.length > 0) return ['All', ...categories.map((c: any) => typeof c === 'string' ? c : c?.name || String(c))];
    const tags = new Set<string>();
    products.forEach(p => p.tags?.forEach(t => tags.add(t)));
    return ['All', ...Array.from(tags).sort()];
  }, [categories, products]);

  const displayProducts = products.slice(0, 6);

  const addToCart = (p: Product) => {
    addItem({ id: p.id, name: p.name, price: p.price, image: p.image });
  };

  return (
    <>
      <div className="screen-content page-enter" style={{ background: colors.bg }}>
        {/* Header */}
        <div className="header" style={{ background: colors.card, borderColor: colors.border }}>
          <img src="/assets/images/logo.png" alt="Errand Shop" style={{ height: 32, objectFit: 'contain' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => navigate('/support')} style={{ border: 'none', cursor: 'pointer', position: 'relative', width: 36, height: 36, borderRadius: '50%', background: colors.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            </button>
            <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <div className="avatar-placeholder">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.sub} strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            </button>
          </div>
        </div>

        {/* Greeting */}
        <div style={{ padding: '16px 16px 4px' }}>
          <p style={{ color: colors.sub, fontSize: 14 }}>Good day 👋</p>
          <h2 style={{ color: colors.text, fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 800, marginTop: 2 }}>
            {user?.first_name ? `Hey, ${user.first_name}!` : 'What are you shopping for?'}
          </h2>
        </div>

        {/* Search */}
        <div className="search-bar" style={{ background: colors.muted, borderColor: colors.border }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.sub} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            placeholder="Search products..."
            value={q}
            onChange={e => setQ(e.target.value)}
            style={{ color: colors.text }}
          />
          {q && <button onClick={() => setQ('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.sub }}>✕</button>}
        </div>

        {/* Categories */}
        <div className="category-scroll">
          {allCategories.map(cat => (
            <button key={cat} className={`chip${activeCategory === cat ? ' active' : ''}`} onClick={() => setActiveCategory(cat)}
              style={{ background: activeCategory === cat ? colors.brandLight : colors.muted, borderColor: activeCategory === cat ? colors.brand : colors.border, color: activeCategory === cat ? colors.brand : colors.sub }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Promo Banner */}
        <div className="promo-banner">
          <div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 900, fontSize: 20, color: '#fff' }}>Fresh Deals!</h3>
            <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: 4, fontSize: 14 }}>Shop groceries delivered to you</p>
            <button onClick={() => navigate('/products')} style={{ marginTop: 12, background: '#fff', color: colors.brand, border: 'none', borderRadius: 10, padding: '8px 16px', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
              Shop Now →
            </button>
          </div>
        </div>

        {/* Popular Items */}
        <div className="section-header">
          <h3 className="section-title" style={{ color: colors.text }}>Popular Items</h3>
          <button className="view-all" onClick={() => navigate('/products')}>View All</button>
        </div>

        {loading && !products.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 16px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ borderRadius: 14, overflow: 'hidden' }}>
                <div className="skeleton" style={{ height: 140, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 16, width: '70%', marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 14, width: '50%' }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="product-grid">
            {displayProducts.map(p => (
              <ProductCard key={p.id} product={p} onAdd={() => addToCart(p)} />
            ))}
          </div>
        )}

        {!loading && !products.length && (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17"/></svg>
            <h3>No products found</h3>
            <p>Try a different search or category</p>
          </div>
        )}
      </div>
      <TabBar />

      {/* FAB */}
      <button className="fab" onClick={() => navigate('/custom-request')} title="Custom Request">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    </>
  );
}
