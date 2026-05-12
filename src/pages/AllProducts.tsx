import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TabBar from '../components/TabBar';
import { useProductStore, useCartStore } from '../store/index';
import { useTheme } from '../theme/ThemeProvider';
import { Product } from '../services/apiService';

function money(v: number) { return `₦${v.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`; }

export default function AllProductsPage() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { products, categories, loading, fetchProducts, fetchCategories } = useProductStore();
  const { addItem } = useCartStore();
  const [q, setQ] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [toast, setToast] = useState('');

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      const params: any = {};
      if (activeCat !== 'All') params.category = activeCat;
      if (q.trim()) params.search = q.trim();
      fetchProducts(params);
    }, 300);
    return () => clearTimeout(timer);
  }, [q, activeCat]);

  const allCats = useMemo(() => {
    if (categories.length > 0) return ['All', ...categories.map((c: any) => typeof c === 'string' ? c : c?.name || String(c))];
    const tags = new Set<string>();
    products.forEach(p => p.tags?.forEach(t => tags.add(t)));
    return ['All', ...Array.from(tags).sort()];
  }, [categories, products]);

  const addToCart = (p: Product) => {
    addItem({ id: p.id, name: p.name, price: p.price, image: p.image });
    setToast(`${p.name} added to cart`);
    setTimeout(() => setToast(''), 2000);
  };

  return (
    <>
      <div className="screen-content page-enter" style={{ background: colors.bg }}>
        <div className="header" style={{ background: colors.card, borderColor: colors.border }}>
          <button onClick={() => navigate(-1)} className="header-back">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5m7-7l-7 7 7 7"/></svg>
          </button>
          <span className="header-title" style={{ color: colors.text }}>All Products</span>
          <div style={{ width: 32 }} />
        </div>

        <div className="search-bar" style={{ background: colors.muted, borderColor: colors.border }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.sub} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Search products..." value={q} onChange={e => setQ(e.target.value)} style={{ color: colors.text }} />
          {q && <button onClick={() => setQ('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.sub }}>✕</button>}
        </div>

        <div className="category-scroll">
          {allCats.map(c => (
            <button key={c} className={`chip${activeCat === c ? ' active' : ''}`} onClick={() => setActiveCat(c)}
              style={{ background: activeCat === c ? colors.brandLight : colors.muted, borderColor: activeCat === c ? colors.brand : colors.border, color: activeCat === c ? colors.brand : colors.sub }}>
              {c}
            </button>
          ))}
        </div>

        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: colors.sub, fontSize: 13, fontWeight: 600 }}>{loading ? 'Loading...' : `${products.length} products`}</span>
        </div>

        {loading && !products.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 16px' }}>
            {[...Array(8)].map((_, i) => <div key={i}><div className="skeleton" style={{ height: 130, borderRadius: 14, marginBottom: 8 }} /><div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 6 }} /><div className="skeleton" style={{ height: 20, width: '50%' }} /></div>)}
          </div>
        ) : (
          <div className="product-grid">
            {products.map(p => {
              const isOut = !p.inStock || (p.stockCount || 0) === 0;
              return (
                <div key={p.id} className="product-card" onClick={() => navigate(`/products/${p.id}`)}>
                  <div className="product-thumb">
                    {p.image ? <img src={p.image} alt={p.name} loading="lazy" /> : <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.5"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 2.293c-.63.63-.184 1.707.707 1.707H17"/></svg>}
                    {isOut && <span className="stock-badge" style={{ background: '#EF4444' }}>Out</span>}
                    {!isOut && (p.stockCount || 0) <= 5 && (p.stockCount || 0) > 0 && <span className="stock-badge" style={{ background: '#F59E0B' }}>Low</span>}
                    {p.tags?.includes('Sale') && <span className="sale-tag">Sale</span>}
                  </div>
                  <div className="product-name" style={{ color: colors.text, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  {p.subtitle && <div className="product-sub" style={{ color: colors.sub }}>{p.subtitle}</div>}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <span className="product-price" style={{ color: colors.text, fontSize: 14 }}>{money(p.price)}</span>
                    <button className={`add-btn${isOut ? ' disabled' : ''}`} onClick={e => { e.stopPropagation(); if (!isOut) addToCart(p); }} style={{ width: 28, height: 28, borderRadius: 10 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && !products.length && (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <h3 style={{ color: colors.text }}>No products found</h3>
            <p style={{ color: colors.sub }}>Try adjusting your search</p>
          </div>
        )}
      </div>
      <TabBar />

      {toast && (
        <div className="toast-enter" style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: colors.text, color: colors.bg, padding: '10px 20px', borderRadius: 12, fontWeight: 700, fontSize: 14, zIndex: 300, whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          🛒 {toast}
        </div>
      )}
    </>
  );
}
