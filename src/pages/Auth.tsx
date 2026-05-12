import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/index';
import { useTheme } from '../theme/ThemeProvider';
import { apiService } from '../services/apiService';

// ─── SIGNUP ────────────────────────────────────────────────────────────────────
export function SignupPage() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', password: '', confirm: '' });
  const [localError, setLocalError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLocalError(''); clearError();
    if (!form.first_name || !form.last_name || !form.email || !form.phone || !form.password) { setLocalError('Please fill all fields'); return; }
    if (form.password !== form.confirm) { setLocalError('Passwords do not match'); return; }
    if (form.password.length < 6) { setLocalError('Password must be at least 6 characters'); return; }
    const ok = await register({ first_name: form.first_name, last_name: form.last_name, email: form.email, phone: form.phone, password: form.password });
    if (ok) navigate('/verify-email', { state: { email: form.email } });
  };

  const err = localError || error;
  const { colors: c } = useTheme();
  const inputStyle = { background: c.muted, borderColor: c.border, color: c.text };

  return (
    <div className="screen-content no-tab" style={{ background: colors.bg, padding: '0 0 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', paddingTop: 48, gap: 12 }}>
        <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text, display: 'flex', alignItems: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5m7-7l-7 7 7 7"/></svg>
        </button>
        <h2 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 20, color: colors.text }}>Create Account</h2>
      </div>

      <form onSubmit={onSubmit} style={{ padding: '0 16px' }}>
        {err && <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#DC2626', fontSize: 14 }}>{err}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="form-label" style={{ color: colors.text }}>First Name</label>
            <input className="input" placeholder="John" value={form.first_name} onChange={set('first_name')} style={inputStyle} />
          </div>
          <div>
            <label className="form-label" style={{ color: colors.text }}>Last Name</label>
            <input className="input" placeholder="Doe" value={form.last_name} onChange={set('last_name')} style={inputStyle} />
          </div>
        </div>
        <label className="form-label" style={{ color: colors.text }}>Email</label>
        <input className="input" type="email" placeholder="john@example.com" value={form.email} onChange={set('email')} style={inputStyle} />
        <label className="form-label" style={{ color: colors.text }}>Phone</label>
        <input className="input" type="tel" placeholder="+234..." value={form.phone} onChange={set('phone')} style={inputStyle} />
        <label className="form-label" style={{ color: colors.text }}>Password</label>
        <div style={{ position: 'relative' }}>
          <input className="input" type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password} onChange={set('password')} style={{ ...inputStyle, paddingRight: 48 }} />
          <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: colors.sub }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
        <label className="form-label" style={{ color: colors.text }}>Confirm Password</label>
        <input className="input" type="password" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} style={inputStyle} />

        <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 24, opacity: isLoading ? 0.7 : 1 }} disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 }}>
          <span style={{ color: colors.sub, fontSize: 14 }}>Already have an account?</span>
          <button type="button" onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.brand, fontWeight: 800, fontSize: 14 }}>Log In</button>
        </div>
      </form>
    </div>
  );
}

// ─── VERIFY EMAIL ──────────────────────────────────────────────────────────────
export function VerifyEmailPage() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!code.trim()) { setError('Please enter the verification code'); return; }
    setLoading(true);
    const res = await apiService.verifyEmail(code.trim());
    setLoading(false);
    if (res.success) { setSuccess(true); setTimeout(() => navigate('/login'), 2000); }
    else setError(res.message || 'Verification failed');
  };

  return (
    <div className="screen-content no-tab" style={{ background: colors.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px', gap: 24 }}>
      <div style={{ width: 72, height: 72, borderRadius: 20, background: colors.brandLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={colors.brand} strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, color: colors.text, marginBottom: 8 }}>Verify Your Email</h2>
        <p style={{ color: colors.sub, fontSize: 14 }}>We sent a verification code to your email. Enter it below.</p>
      </div>
      {success && <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: 10, padding: '12px 16px', color: '#059669', fontWeight: 700, width: '100%', textAlign: 'center' }}>✓ Email verified! Redirecting...</div>}
      {!success && (
        <form onSubmit={onSubmit} style={{ width: '100%' }}>
          {error && <div style={{ background: '#FEE2E2', borderRadius: 10, padding: '10px 14px', color: '#DC2626', marginBottom: 12, fontSize: 14 }}>{error}</div>}
          <input className="input" placeholder="Enter verification code" value={code} onChange={e => setCode(e.target.value)} style={{ background: colors.muted, borderColor: colors.border, color: colors.text, textAlign: 'center', fontSize: 18, letterSpacing: 4 }} />
          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 16 }} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
      )}
      <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.sub, fontSize: 14 }}>Back to Login</button>
    </div>
  );
}

// ─── FORGOT PASSWORD ───────────────────────────────────────────────────────────
export function ForgotPage() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'code' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPw, setNewPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!email.includes('@')) { setError('Please enter a valid email'); return; }
    setLoading(true);
    const res = await apiService.forgotPassword(email);
    setLoading(false);
    if (res.success) setStep('code');
    else setError(res.message || 'Failed');
  };

  const resetPw = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!code || !newPw) { setError('Please fill all fields'); return; }
    setLoading(true);
    const res = await apiService.resetPassword(email, code, newPw);
    setLoading(false);
    if (res.success) setStep('done');
    else setError(res.message || 'Failed');
  };

  const inputStyle = { background: colors.muted, borderColor: colors.border, color: colors.text };

  return (
    <div className="screen-content no-tab" style={{ background: colors.bg, padding: '48px 20px' }}>
      <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontWeight: 700 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5m7-7l-7 7 7 7"/></svg>
        Back
      </button>
      <h2 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 22, color: colors.text, marginBottom: 8 }}>Reset Password</h2>
      {step === 'done' ? (
        <div style={{ textAlign: 'center', paddingTop: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
          </div>
          <h3 style={{ color: colors.text, fontFamily: 'Sora,sans-serif', fontWeight: 800 }}>Password Updated!</h3>
          <p style={{ color: colors.sub, margin: '8px 0 24px', fontSize: 14 }}>Your password has been successfully reset.</p>
          <button className="btn btn-primary btn-full" onClick={() => navigate('/login')}>Log In</button>
        </div>
      ) : step === 'email' ? (
        <form onSubmit={sendCode}>
          <p style={{ color: colors.sub, fontSize: 14, marginBottom: 20 }}>Enter your email and we'll send you a reset code.</p>
          {error && <div style={{ background: '#FEE2E2', borderRadius: 10, padding: '10px 14px', color: '#DC2626', marginBottom: 12, fontSize: 14 }}>{error}</div>}
          <label className="form-label" style={{ color: colors.text, marginTop: 0 }}>Email</label>
          <input className="input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 20 }} disabled={loading}>{loading ? 'Sending...' : 'Send Reset Code'}</button>
        </form>
      ) : (
        <form onSubmit={resetPw}>
          <p style={{ color: colors.sub, fontSize: 14, marginBottom: 20 }}>Enter the code sent to <strong>{email}</strong> and your new password.</p>
          {error && <div style={{ background: '#FEE2E2', borderRadius: 10, padding: '10px 14px', color: '#DC2626', marginBottom: 12, fontSize: 14 }}>{error}</div>}
          <label className="form-label" style={{ color: colors.text, marginTop: 0 }}>Reset Code</label>
          <input className="input" placeholder="Enter code" value={code} onChange={e => setCode(e.target.value)} style={{ ...inputStyle, textAlign: 'center', letterSpacing: 4 }} />
          <label className="form-label" style={{ color: colors.text }}>New Password</label>
          <input className="input" type="password" placeholder="New password" value={newPw} onChange={e => setNewPw(e.target.value)} style={inputStyle} />
          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 20 }} disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
        </form>
      )}
    </div>
  );
}

// ─── ONBOARDING ────────────────────────────────────────────────────────────────
export function OnboardingPage() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const slides = [
    { title: 'Shop Effortlessly', desc: 'Browse thousands of products and get them delivered to your door.', icon: '/assets/images/phone-basket.png' },
    { title: 'Custom Requests', desc: 'Can\'t find what you need? Send a custom request and we\'ll source it for you.', icon: '/assets/images/hand-heart.png' },
    { title: 'Fast Delivery', desc: 'Track your orders in real-time and get notified at every step.', icon: '/assets/images/signature-cart.png' },
  ];
  const [idx, setIdx] = useState(0);

  return (
    <div className="screen-content no-tab" style={{ background: colors.bg, display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
        <img src={slides[idx].icon} alt="" style={{ width: 160, height: 160, objectFit: 'contain', marginBottom: 32 }} />
        <h2 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 900, fontSize: 26, color: colors.text, textAlign: 'center', marginBottom: 12 }}>{slides[idx].title}</h2>
        <p style={{ color: colors.sub, textAlign: 'center', lineHeight: 1.6, fontSize: 15 }}>{slides[idx].desc}</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
        {slides.map((_, i) => <div key={i} style={{ width: i === idx ? 24 : 8, height: 8, borderRadius: 4, background: i === idx ? colors.brand : colors.border, transition: 'width .3s ease' }} />)}
      </div>
      <div style={{ padding: '0 24px 40px', display: 'flex', gap: 12 }}>
        {idx < slides.length - 1 ? (
          <>
            <button className="btn btn-ghost" onClick={() => navigate('/login')} style={{ flex: 1 }}>Skip</button>
            <button className="btn btn-primary" onClick={() => setIdx(i => i + 1)} style={{ flex: 2 }}>Next</button>
          </>
        ) : (
          <button className="btn btn-primary btn-full" onClick={() => navigate('/login')}>Get Started</button>
        )}
      </div>
    </div>
  );
}
