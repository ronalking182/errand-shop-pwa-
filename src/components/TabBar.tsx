import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCartStore } from '../store/index';

const tabs = [
  { to: '/', label: 'Home', icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'var(--brand)' : 'none'} stroke={active ? 'var(--brand)' : 'var(--sub)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  )},
  { to: '/orders', label: 'Orders', icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--brand)' : 'var(--sub)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="12" y2="16"/>
    </svg>
  )},
  { to: '/cart', label: 'Cart', icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--brand)' : 'var(--sub)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
    </svg>
  ), badge: true },
  { to: '/custom-request', label: 'Request', icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--brand)' : 'var(--sub)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  )},
  { to: '/profile', label: 'Profile', icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--brand)' : 'var(--sub)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  )},
];

export default function TabBar() {
  const { itemCount } = useCartStore();
  return (
    <nav className="tab-bar">
      {tabs.map(tab => (
        <NavLink key={tab.to} to={tab.to} end={tab.to === '/'} className={({ isActive }) => `tab-item${isActive ? ' active' : ''}`}>
          {({ isActive }) => (
            <>
              <span className="tab-icon">{tab.icon(isActive)}</span>
              {tab.badge && itemCount > 0 && <span className="tab-badge"><span className="badge">{itemCount > 99 ? '99+' : itemCount}</span></span>}
              <span>{tab.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
