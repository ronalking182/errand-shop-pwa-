import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/index';
import { useTheme } from '../theme/ThemeProvider';

export default function LoginPage() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [localError, setLocalError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();
    if (!email || !password) { setLocalError('Please fill in all fields'); return; }
    if (!email.includes('@')) { setLocalError('Please enter a valid email'); return; }
    const ok = await login(email, password);
    if (ok) navigate('/');
  };

  const errMsg = localError || error;

  return (
    <div className="screen-content no-tab" style={{ background: colors.bg, display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      {/* Top */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48, paddingBottom: 16 }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: colors.brandLight, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 4px 20px rgba(255,122,47,.2)' }}>
          <img src="/assets/images/signature-cart.png" alt="" style={{ width: 44, height: 44, objectFit: 'contain' }} />
        </div>
        <img src="/assets/images/logo.png" alt="Errand Shop" style={{ height: 40, objectFit: 'contain' }} />
        <p style={{ color: colors.sub, marginTop: 6, fontSize: 14 }}>Your shopping companion</p>
      </div>

      {/* Card */}
      <form onSubmit={onSubmit} style={{ margin: '0 16px', background: colors.card, borderRadius: 20, padding: '24px 20px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 22, color: colors.text, marginBottom: 20 }}>Welcome Back!</h2>

        {errMsg && <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#DC2626', fontSize: 14, fontWeight: 600 }}>{errMsg}</div>}

        <label className="form-label" style={{ color: colors.text, marginTop: 0 }}>Email Address</label>
        <input className="input" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} style={{ background: colors.muted, borderColor: colors.border, color: colors.text }} autoComplete="email" />

        <label className="form-label" style={{ color: colors.text }}>Password</label>
        <div style={{ position: 'relative' }}>
          <input className="input" type={showPw ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} style={{ background: colors.muted, borderColor: colors.border, color: colors.text, paddingRight: 48 }} autoComplete="current-password" />
          <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: colors.sub }}>
            {showPw ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
          </button>
        </div>

        <div style={{ textAlign: 'right', marginTop: 8 }}>
          <button type="button" onClick={() => navigate('/forgot')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.brand, fontWeight: 700, fontSize: 13 }}>Forgot password?</button>
        </div>

        <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 20, opacity: isLoading ? 0.7 : 1 }} disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20, marginBottom: 32 }}>
        <span style={{ color: colors.sub, fontSize: 14 }}>Don't have an account?</span>
        <button onClick={() => navigate('/signup')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.brand, fontWeight: 800, fontSize: 14 }}>Sign Up</button>
      </div>
    </div>
  );
}
