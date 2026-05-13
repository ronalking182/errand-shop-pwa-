import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/index';
import { useTheme } from '../theme/ThemeProvider';
import { apiService } from '../services/apiService';
import TabBar from '../components/TabBar';
import { PwaInstallPrompt } from '../components/PwaInstallPrompt';

// ─── PROFILE ────────────────────────────────────────────────────────────────────
export function ProfilePage() {
  const { colors, mode, cycleMode } = useTheme();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    apiService.getCustomerProfile().then(res => { if (res.success) setProfile(res.data); });
  }, []);

  const rows = [
    { icon: '👤', label: 'Edit Profile', to: '/profile/edit' },
    { icon: '📍', label: 'My Addresses', to: '/profile/addresses' },
    { icon: '📦', label: 'My Orders', to: '/orders' },
    { icon: '📋', label: 'My Requests', to: '/my-requests' },
    { icon: '💬', label: 'Support Chat', to: '/support' },
    { icon: '🔒', label: 'Change Password', to: '/profile/change-password' },
  ];

  const doLogout = async () => { await logout(); navigate('/login'); };

  return (
    <>
      <div className="screen-content page-enter" style={{ background: colors.bg }}>
        <div className="header" style={{ background: colors.card, borderColor: colors.border }}>
          <span className="header-title" style={{ color: colors.text }}>Profile</span>
          <button
            type="button"
            title={mode === 'light' ? 'Light · tap for dark' : mode === 'dark' ? 'Dark · tap to match device' : 'Matching device · tap for light'}
            onClick={() => cycleMode()}
            style={{ background: colors.muted, border: 'none', borderRadius: 10, padding: '6px 10px', cursor: 'pointer', fontSize: 18 }}
          >
            {mode === 'light' ? '☀️' : mode === 'dark' ? '🌙' : '📱'}
          </button>
        </div>

        <PwaInstallPrompt spacing="16px 16px 0" />

        {/* Avatar + name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 16px 20px', background: colors.card, borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: colors.brandLight, border: `3px solid ${colors.brand}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden' }}>
            {profile?.avatar ? <img src={profile.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={colors.brand} strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
          </div>
          <h2 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 20, color: colors.text }}>
            {profile ? `${profile.firstName} ${profile.lastName}` : user ? `${user.first_name} ${user.last_name}` : 'Loading...'}
          </h2>
          <p style={{ color: colors.sub, fontSize: 14, marginTop: 4 }}>{user?.email}</p>
          {user?.phone && <p style={{ color: colors.sub, fontSize: 13, marginTop: 2 }}>{user.phone}</p>}
        </div>

        {/* Menu */}
        <div style={{ background: colors.card, margin: '12px 16px', borderRadius: 16, border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
          {rows.map((row, i) => (
            <div key={row.to} className="profile-row" style={{ borderColor: colors.border }} onClick={() => navigate(row.to)}>
              <div className="profile-row-icon" style={{ background: colors.brandLight }}>
                <span style={{ fontSize: 18 }}>{row.icon}</span>
              </div>
              <span className="profile-row-label" style={{ color: colors.text }}>{row.label}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.sub} strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          ))}
        </div>

        <div style={{ padding: '0 16px 32px' }}>
          <button onClick={doLogout} style={{ width: '100%', padding: '14px', border: `1.5px solid #EF4444`, borderRadius: 14, background: '#FEF2F2', color: '#EF4444', fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
            Sign Out
          </button>
        </div>
      </div>
      <TabBar />
    </>
  );
}

// ─── EDIT PROFILE ──────────────────────────────────────────────────────────────
export function EditProfilePage() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', gender: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    apiService.getCustomerProfile().then(res => {
      if (res.success && res.data) setForm({ firstName: res.data.firstName, lastName: res.data.lastName, phone: res.data.phone, gender: res.data.gender || '' });
    });
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setMsg('');
    setLoading(true);
    const res = await apiService.updateCustomerProfile(form);
    setLoading(false);
    if (res.success) { setMsg('Profile updated!'); setTimeout(() => navigate('/profile'), 1500); }
    else setError(res.message || 'Update failed');
  };

  const inputStyle = { background: colors.muted, borderColor: colors.border, color: colors.text };

  return (
    <div className="screen-content no-tab page-enter" style={{ background: colors.bg }}>
      <div className="header" style={{ background: colors.card, borderColor: colors.border }}>
        <button onClick={() => navigate(-1)} className="header-back"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5m7-7l-7 7 7 7"/></svg></button>
        <span className="header-title" style={{ color: colors.text }}>Edit Profile</span>
        <div style={{ width: 32 }} />
      </div>
      <form onSubmit={save} style={{ padding: '16px 16px 32px' }}>
        {error && <div style={{ background: '#FEE2E2', borderRadius: 10, padding: '10px 14px', color: '#DC2626', marginBottom: 12, fontSize: 14 }}>{error}</div>}
        {msg && <div style={{ background: '#D1FAE5', borderRadius: 10, padding: '10px 14px', color: '#059669', marginBottom: 12, fontSize: 14, fontWeight: 700 }}>{msg}</div>}
        <label className="form-label" style={{ color: colors.text }}>First Name</label>
        <input className="input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} style={inputStyle} />
        <label className="form-label" style={{ color: colors.text }}>Last Name</label>
        <input className="input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} style={inputStyle} />
        <label className="form-label" style={{ color: colors.text }}>Phone</label>
        <input className="input" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} />
        <label className="form-label" style={{ color: colors.text }}>Gender</label>
        <select className="input" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} style={inputStyle}>
          <option value="">Prefer not to say</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 24 }} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
      </form>
    </div>
  );
}

// ─── ADDRESSES ─────────────────────────────────────────────────────────────────
export function AddressesPage() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: '', type: 'home', street: '', city: '', state: '', country: 'Nigeria', postal_code: '', is_default: false });
  const [saving, setSaving] = useState(false);

  const load = () => { setLoading(true); apiService.getCustomerAddresses().then(res => { if (res.success) setAddresses(res.data || []); setLoading(false); }); };
  useEffect(load, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    await apiService.createCustomerAddress(form);
    setSaving(false); setShowForm(false); load();
  };

  const del = async (id: string) => { await apiService.deleteCustomerAddress(id); load(); };

  const inputStyle = { background: colors.muted, borderColor: colors.border, color: colors.text };

  return (
    <div className="screen-content no-tab page-enter" style={{ background: colors.bg }}>
      <div className="header" style={{ background: colors.card, borderColor: colors.border }}>
        <button onClick={() => navigate(-1)} className="header-back"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5m7-7l-7 7 7 7"/></svg></button>
        <span className="header-title" style={{ color: colors.text }}>My Addresses</span>
        <button onClick={() => setShowForm(!showForm)} style={{ background: colors.brand, border: 'none', borderRadius: 10, padding: '6px 12px', cursor: 'pointer', color: '#fff', fontWeight: 700, fontSize: 13 }}>+ Add</button>
      </div>

      {showForm && (
        <form onSubmit={save} style={{ padding: '16px', background: colors.card, margin: '12px 16px', borderRadius: 16, border: `1px solid ${colors.border}` }}>
          <h3 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, color: colors.text, marginBottom: 14 }}>New Address</h3>
          <label className="form-label" style={{ color: colors.text, marginTop: 0 }}>Label (e.g. Home)</label>
          <input className="input" placeholder="Home" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} style={inputStyle} />
          <label className="form-label" style={{ color: colors.text }}>Street</label>
          <input className="input" placeholder="123 Main Street" value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} style={inputStyle} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label className="form-label" style={{ color: colors.text }}>City</label><input className="input" placeholder="Lagos" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} style={inputStyle} /></div>
            <div><label className="form-label" style={{ color: colors.text }}>State</label><input className="input" placeholder="Lagos" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} style={inputStyle} /></div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_default} onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))} />
            <span style={{ color: colors.text, fontWeight: 600, fontSize: 14 }}>Set as default address</span>
          </label>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>{saving ? 'Saving...' : 'Save Address'}</button>
          </div>
        </form>
      )}

      <div style={{ padding: '8px 16px 32px' }}>
        {loading ? <div style={{ padding: 24, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          : addresses.length === 0 ? (
            <div className="empty-state">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <h3 style={{ color: colors.text }}>No addresses yet</h3>
              <p style={{ color: colors.sub }}>Add your first delivery address</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 12 }}>
              {addresses.map(addr => (
                <div key={addr.id} style={{ background: colors.card, borderRadius: 16, padding: '16px', border: `1px solid ${colors.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, color: colors.text }}>{addr.label}</span>
                        {addr.is_default && <span style={{ background: colors.brandLight, color: colors.brand, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>Default</span>}
                      </div>
                      <p style={{ color: colors.sub, fontSize: 14, lineHeight: 1.5 }}>{addr.street}, {addr.city}, {addr.state}, {addr.country}</p>
                    </div>
                    <button onClick={() => del(addr.id)} style={{ background: '#FEE2E2', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#EF4444', fontWeight: 700, fontSize: 12, flexShrink: 0, marginLeft: 8 }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
export function ChangePasswordPage() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ current: '', newPw: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (form.newPw !== form.confirm) { setError("Passwords don't match"); return; }
    if (form.newPw.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    const res = await apiService.changePassword(form.current, form.newPw);
    setLoading(false);
    if (res.success) { setSuccess(true); setTimeout(() => navigate('/profile'), 2000); }
    else setError(res.message || 'Failed');
  };

  const inputStyle = { background: colors.muted, borderColor: colors.border, color: colors.text };

  return (
    <div className="screen-content no-tab page-enter" style={{ background: colors.bg }}>
      <div className="header" style={{ background: colors.card, borderColor: colors.border }}>
        <button onClick={() => navigate(-1)} className="header-back"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5m7-7l-7 7 7 7"/></svg></button>
        <span className="header-title" style={{ color: colors.text }}>Change Password</span>
        <div style={{ width: 32 }} />
      </div>
      <form onSubmit={save} style={{ padding: '24px 16px' }}>
        {error && <div style={{ background: '#FEE2E2', borderRadius: 10, padding: '10px 14px', color: '#DC2626', marginBottom: 16, fontSize: 14 }}>{error}</div>}
        {success && <div style={{ background: '#D1FAE5', borderRadius: 10, padding: '10px 14px', color: '#059669', marginBottom: 16, fontSize: 14, fontWeight: 700 }}>✓ Password updated!</div>}
        <label className="form-label" style={{ color: colors.text, marginTop: 0 }}>Current Password</label>
        <input className="input" type="password" value={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.value }))} style={inputStyle} />
        <label className="form-label" style={{ color: colors.text }}>New Password</label>
        <input className="input" type="password" value={form.newPw} onChange={e => setForm(f => ({ ...f, newPw: e.target.value }))} style={inputStyle} />
        <label className="form-label" style={{ color: colors.text }}>Confirm New Password</label>
        <input className="input" type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} style={inputStyle} />
        <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 24 }} disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</button>
      </form>
    </div>
  );
}

// ─── CUSTOM REQUEST ────────────────────────────────────────────────────────────
export function CustomRequestPage() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', quantity: 1, unit: 'piece', preferredBrand: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!form.title.trim() || !form.description.trim()) { setError('Please fill in the required fields'); return; }
    setLoading(true);
    const res = await apiService.createCustomRequest(form);
    setLoading(false);
    if (res.success) { setSuccess(true); setTimeout(() => navigate('/my-requests'), 2000); }
    else setError(res.message || 'Failed to submit request');
  };

  const inputStyle = { background: colors.muted, borderColor: colors.border, color: colors.text };

  return (
    <>
      <div className="screen-content page-enter" style={{ background: colors.bg }}>
        <div className="header" style={{ background: colors.card, borderColor: colors.border }}>
          <span className="header-title" style={{ color: colors.text }}>Custom Request</span>
          <button onClick={() => navigate('/my-requests')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.brand, fontWeight: 700, fontSize: 13 }}>My Requests</button>
        </div>

        <div style={{ padding: '16px 16px 32px' }}>
          <div style={{ background: colors.brandLight, borderRadius: 14, padding: 16, marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 24 }}>💡</span>
            <div>
              <p style={{ fontWeight: 700, color: colors.brand, marginBottom: 4 }}>Can't find what you need?</p>
              <p style={{ color: colors.sub, fontSize: 14, lineHeight: 1.6 }}>Describe the product and we'll source it for you. Our team will review and send you a quote.</p>
            </div>
          </div>

          {error && <div style={{ background: '#FEE2E2', borderRadius: 10, padding: '10px 14px', color: '#DC2626', marginBottom: 16, fontSize: 14 }}>{error}</div>}
          {success && <div style={{ background: '#D1FAE5', borderRadius: 10, padding: '10px 14px', color: '#059669', marginBottom: 16, fontWeight: 700 }}>✓ Request submitted! Redirecting...</div>}

          <form onSubmit={submit}>
            <label className="form-label" style={{ color: colors.text, marginTop: 0 }}>Product Name *</label>
            <input className="input" placeholder="e.g. Organic Oat Milk 1L" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} />
            <label className="form-label" style={{ color: colors.text }}>Description *</label>
            <textarea className="input" placeholder="Describe the product in detail..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ ...inputStyle, minHeight: 100, resize: 'vertical', fontFamily: 'inherit' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="form-label" style={{ color: colors.text }}>Quantity</label>
                <input className="input" type="number" min="1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))} style={inputStyle} />
              </div>
              <div>
                <label className="form-label" style={{ color: colors.text }}>Unit</label>
                <select className="input" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} style={inputStyle}>
                  {['piece', 'kg', 'g', 'liter', 'ml', 'pack', 'box', 'bag', 'bottle'].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <label className="form-label" style={{ color: colors.text }}>Preferred Brand (optional)</label>
            <input className="input" placeholder="e.g. Quaker, Nestlé..." value={form.preferredBrand} onChange={e => setForm(f => ({ ...f, preferredBrand: e.target.value }))} style={inputStyle} />
            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 24 }} disabled={loading}>{loading ? 'Submitting...' : 'Submit Request'}</button>
          </form>
        </div>
      </div>
      <TabBar />
    </>
  );
}

// ─── MY REQUESTS ───────────────────────────────────────────────────────────────
export function MyRequestsPage() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getCustomRequests().then(res => { if (res.success) setRequests(res.data || []); setLoading(false); });
  }, []);

  const statusColor = (s: string) => {
    const m: Record<string, string> = { submitted: '#2563EB', under_review: '#D97706', quote_sent: '#7C3AED', customer_accepted: '#059669', approved: '#059669', cancelled: '#DC2626', in_cart: '#D97706' };
    return m[s] || '#6B7280';
  };
  const statusBg = (s: string) => {
    const m: Record<string, string> = { submitted: '#DBEAFE', under_review: '#FEF3C7', quote_sent: '#EDE9FE', customer_accepted: '#D1FAE5', approved: '#D1FAE5', cancelled: '#FEE2E2', in_cart: '#FEF3C7' };
    return m[s] || '#F3F4F6';
  };

  return (
    <>
      <div className="screen-content page-enter" style={{ background: colors.bg }}>
        <div className="header" style={{ background: colors.card, borderColor: colors.border }}>
          <button onClick={() => navigate(-1)} className="header-back"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5m7-7l-7 7 7 7"/></svg></button>
          <span className="header-title" style={{ color: colors.text }}>My Requests</span>
          <button onClick={() => navigate('/custom-request')} style={{ background: colors.brand, border: 'none', borderRadius: 10, padding: '6px 12px', cursor: 'pointer', color: '#fff', fontWeight: 700, fontSize: 13 }}>+ New</button>
        </div>

        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
          : requests.length === 0 ? (
            <div className="empty-state">
              <span style={{ fontSize: 56 }}>📋</span>
              <h3 style={{ color: colors.text }}>No requests yet</h3>
              <p style={{ color: colors.sub }}>Submit a custom request to get started</p>
              <button className="btn btn-primary" onClick={() => navigate('/custom-request')}>New Request</button>
            </div>
          ) : (
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {requests.map(req => (
                <div key={req.id} style={{ background: colors.card, borderRadius: 16, padding: 16, border: `1px solid ${colors.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <h3 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 15, color: colors.text, flex: 1, marginRight: 8 }}>{req.title || req.items?.[0]?.name || 'Custom Request'}</h3>
                    <span style={{ background: statusBg(req.status), color: statusColor(req.status), padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800, flexShrink: 0, textTransform: 'replace-all' }}>{req.status?.replace(/_/g, ' ')}</span>
                  </div>
                  {req.description && <p style={{ color: colors.sub, fontSize: 13, lineHeight: 1.5, marginBottom: 8 }}>{req.description?.slice(0, 80)}{req.description?.length > 80 ? '...' : ''}</p>}
                  {req.adminQuote && <div style={{ background: colors.brandLight, borderRadius: 10, padding: '8px 12px', marginTop: 8 }}>
                    <span style={{ color: colors.brand, fontWeight: 700, fontSize: 14 }}>Quote: ₦{req.adminQuote?.toLocaleString()}</span>
                  </div>}
                  <div style={{ color: colors.sub, fontSize: 12, marginTop: 8 }}>{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : ''}</div>
                </div>
              ))}
            </div>
          )}
      </div>
      <TabBar />
    </>
  );
}

// ─── SUPPORT CHAT ──────────────────────────────────────────────────────────────
export function SupportChatPage() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMsg, setNewMsg] = useState('');
  const [creating, setCreating] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    apiService.getChatRooms().then(res => { if (res.success) setRooms(res.data || []); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!activeRoom) return;
    apiService.getChatMessages(activeRoom.id).then(res => { if (res.success) setMessages(res.data || []); });
  }, [activeRoom]);

  const sendMessage = async () => {
    if (!msg.trim() || !activeRoom || !user) return;
    setSending(true);
    const res = await apiService.sendMessage({ chatRoomId: activeRoom.id, message: msg.trim(), senderId: user.id, senderType: 'user' });
    if (res.success) {
      setMessages(m => [...m, { id: Date.now(), message: msg.trim(), senderType: 'user', timestamp: new Date().toISOString() }]);
      setMsg('');
    }
    setSending(false);
  };

  const createRoom = async () => {
    if (!newSubject.trim() || !newMsg.trim() || !user) return;
    setCreating(true);
    const customerId = parseInt((user as any).customer_id || user.id) || 0;
    const res = await apiService.createChatRoom({ customer_id: customerId, subject: newSubject, message: newMsg });
    if (res.success) {
      setShowNew(false); setNewSubject(''); setNewMsg('');
      apiService.getChatRooms().then(r => { if (r.success) setRooms(r.data || []); });
    }
    setCreating(false);
  };

  if (activeRoom) return (
    <div className="screen-content no-tab" style={{ background: colors.bg, display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <div className="header" style={{ background: colors.card, borderColor: colors.border }}>
        <button onClick={() => setActiveRoom(null)} className="header-back"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5m7-7l-7 7 7 7"/></svg></button>
        <span className="header-title" style={{ color: colors.text }}>Support Chat</span>
        <div style={{ width: 32 }} />
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((m: any) => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.senderType === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '75%', padding: '10px 14px', borderRadius: m.senderType === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: m.senderType === 'user' ? colors.brand : colors.card, color: m.senderType === 'user' ? '#fff' : colors.text, fontSize: 14, lineHeight: 1.5, border: m.senderType !== 'user' ? `1px solid ${colors.border}` : 'none' }}>
              {m.message || m.content || ''}
            </div>
          </div>
        ))}
        {messages.length === 0 && <div style={{ textAlign: 'center', color: colors.sub, fontSize: 14, marginTop: 40 }}>No messages yet. Start the conversation!</div>}
      </div>
      <div style={{ padding: '12px 16px', background: colors.card, borderTop: `1px solid ${colors.border}`, display: 'flex', gap: 8 }}>
        <input className="input" placeholder="Type a message..." value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} style={{ background: colors.muted, borderColor: colors.border, color: colors.text, flex: 1 }} />
        <button onClick={sendMessage} disabled={sending || !msg.trim()} style={{ background: colors.brand, border: 'none', borderRadius: 12, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, opacity: sending || !msg.trim() ? 0.5 : 1 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="screen-content page-enter" style={{ background: colors.bg }}>
        <div className="header" style={{ background: colors.card, borderColor: colors.border }}>
          <button onClick={() => navigate(-1)} className="header-back"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5m7-7l-7 7 7 7"/></svg></button>
          <span className="header-title" style={{ color: colors.text }}>Support</span>
          <button onClick={() => setShowNew(!showNew)} style={{ background: colors.brand, border: 'none', borderRadius: 10, padding: '6px 12px', cursor: 'pointer', color: '#fff', fontWeight: 700, fontSize: 13 }}>+ New</button>
        </div>

        {showNew && (
          <div style={{ padding: '16px', background: colors.card, margin: '12px 16px', borderRadius: 16, border: `1px solid ${colors.border}` }}>
            <h3 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, color: colors.text, marginBottom: 14 }}>New Support Ticket</h3>
            <label className="form-label" style={{ color: colors.text, marginTop: 0 }}>Subject</label>
            <input className="input" placeholder="How can we help?" value={newSubject} onChange={e => setNewSubject(e.target.value)} style={{ background: colors.muted, borderColor: colors.border, color: colors.text }} />
            <label className="form-label" style={{ color: colors.text }}>Message</label>
            <textarea className="input" placeholder="Describe your issue..." value={newMsg} onChange={e => setNewMsg(e.target.value)} style={{ background: colors.muted, borderColor: colors.border, color: colors.text, minHeight: 80, resize: 'none', fontFamily: 'inherit' }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowNew(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={createRoom} disabled={creating}>{creating ? 'Creating...' : 'Create Ticket'}</button>
            </div>
          </div>
        )}

        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
          : rooms.length === 0 ? (
            <div className="empty-state">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              <h3 style={{ color: colors.text }}>No conversations yet</h3>
              <p style={{ color: colors.sub }}>Start a new support ticket above</p>
            </div>
          ) : (
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {rooms.map(room => (
                <div key={room.id} onClick={() => setActiveRoom(room)} style={{ background: colors.card, borderRadius: 16, padding: '16px', border: `1px solid ${colors.border}`, cursor: 'pointer', transition: 'background .12s' }} onMouseEnter={e => (e.currentTarget.style.background = colors.muted)} onMouseLeave={e => (e.currentTarget.style.background = colors.card)}>
                  <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, color: colors.text, marginBottom: 6 }}>{room.subject || 'Support Chat'}</div>
                  {room.lastMessage && <div style={{ color: colors.sub, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.lastMessage.message}</div>}
                </div>
              ))}
            </div>
          )}
      </div>
      <TabBar />
    </>
  );
}

// ─── NOTIFICATIONS ─────────────────────────────────────────────────────────────
export function NotificationsPage() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  return (
    <>
      <div className="screen-content page-enter" style={{ background: colors.bg }}>
        <div className="header" style={{ background: colors.card, borderColor: colors.border }}>
          <button onClick={() => navigate(-1)} className="header-back"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5m7-7l-7 7 7 7"/></svg></button>
          <span className="header-title" style={{ color: colors.text }}>Notifications</span>
          <div style={{ width: 32 }} />
        </div>
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          <h3 style={{ color: colors.text }}>All caught up!</h3>
          <p style={{ color: colors.sub }}>No new notifications right now</p>
        </div>
      </div>
      <TabBar />
    </>
  );
}
