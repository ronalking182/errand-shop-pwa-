import React from 'react';

interface Props { children: React.ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100dvh', padding: 24, textAlign: 'center', background: '#fff', fontFamily: 'sans-serif' }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" style={{ marginBottom: 16 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h2 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 20, color: '#111', marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 24, lineHeight: 1.6, maxWidth: 300 }}>
            The app encountered an unexpected error. Please refresh the page to continue.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ background: '#FF6B00', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 32px', fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}
          >
            Refresh App
          </button>
          {this.state.error && (
            <details style={{ marginTop: 24, color: '#9CA3AF', fontSize: 11, maxWidth: 320 }}>
              <summary style={{ cursor: 'pointer', marginBottom: 8 }}>Technical details</summary>
              <pre style={{ textAlign: 'left', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{this.state.error.message}</pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
