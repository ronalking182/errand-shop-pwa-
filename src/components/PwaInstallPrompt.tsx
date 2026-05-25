import React, { useEffect, useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';

const DISMISS_KEY = 'errand_shop_pwa_install_dismiss_v2';

function readStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  try {
    if (window.matchMedia('(display-mode: window-controls-overlay)').matches) return true;
  } catch {
    /* ignore */
  }
  const nav = navigator as Navigator & { standalone?: boolean };
  if (typeof nav.standalone === 'boolean' && nav.standalone) return true;
  return false;
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isIosNonStandaloneBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/i.test(ua);
  const iPadOs13 =
    navigator.platform === 'MacIntel' &&
    (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints !== undefined &&
    ((navigator as Navigator & { maxTouchPoints: number }).maxTouchPoints ?? 0) > 1;
  if (!ios && !iPadOs13) return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return !(nav.standalone === true);
}

function fallbackInstallHint(): string {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
  if (/iPad|iPhone|iPod/i.test(ua)) {
    return 'Share → Add to Home Screen.';
  }
  if (/Android/i.test(ua)) {
    return '⋮ menu → Install app.';
  }
  return '⋮ menu → Install, or tap ⊕ in the address bar.';
}

type PwaInstallPromptProps = {
  spacing?: string;
  /** Allow user to dismiss the banner (persisted in localStorage). */
  dismissable?: boolean;
  /** Space below banner before content (login card, etc.) */
  gapAfter?: number;
};

export function PwaInstallPrompt({
  spacing = '0 16px',
  dismissable = true,
  gapAfter = 22,
}: PwaInstallPromptProps) {
  const { colors, appearance } = useTheme();
  const [standalone] = useState(readStandalone);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() =>
    dismissable ? localStorage.getItem(DISMISS_KEY) === '1' : false,
  );
  const [installing, setInstalling] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    if (readStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY) === '1') return;
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBip);
    return () => window.removeEventListener('beforeinstallprompt', onBip);
  }, []);

  const showIosSafariTips = ready && !standalone && !dismissed && isIosNonStandaloneBrowser();
  const showChromiumButton = deferred !== null;

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, '1');
  };

  const onInstallClick = async () => {
    if (!deferred) return;
    setInstalling(true);
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {
      // ignore
    } finally {
      setDeferred(null);
      setInstalling(false);
    }
  };

  if (!ready || standalone || dismissed) return null;

  const isDark = appearance === 'dark';
  const accentBorder = 'rgba(255, 122, 47, 0.28)';
  const iconBg = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.85)';

  const title =
    showIosSafariTips ? 'Add to Home Screen' : showChromiumButton ? 'Install app' : 'Get the app';

  const subtitle = showIosSafariTips ? 'Share → Add to Home Screen.' : showChromiumButton ? null : fallbackInstallHint();

  const panelBg = isDark ? 'rgba(255, 122, 47, 0.08)' : '#FFF8F3';

  return (
    <div style={{ padding: spacing, paddingTop: 0, marginTop: 4, marginBottom: gapAfter, position: 'relative', zIndex: 2 }}>
      <div
        role="region"
        aria-label="Install web app"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          borderRadius: 12,
          border: `1px solid ${accentBorder}`,
          padding: '10px 12px',
          background: panelBg,
          boxShadow: isDark ? '0 1px 8px rgba(0,0,0,0.2)' : '0 2px 10px rgba(255,122,47,0.08)',
        }}
      >
        <div
          aria-hidden
          style={{
            flexShrink: 0,
            width: 36,
            height: 36,
            marginTop: 1,
            borderRadius: 10,
            background: iconBg,
            border: `1px solid ${accentBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 17,
          }}
        >
          📲
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'Sora, sans-serif',
              fontWeight: 700,
              fontSize: 13,
              color: colors.text,
              letterSpacing: -0.02,
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <p
              style={{
                margin: '3px 0 0',
                fontSize: 11.5,
                lineHeight: 1.35,
                color: colors.sub,
                maxHeight: '2.7em',
                overflow: 'hidden',
              }}
            >
              {subtitle}
            </p>
          )}
          {showChromiumButton ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <button
                type="button"
                disabled={installing}
                onClick={onInstallClick}
                style={{
                  fontFamily: 'Sora, sans-serif',
                  fontWeight: 700,
                  fontSize: 12,
                  padding: '7px 14px',
                  borderRadius: 9,
                  border: 'none',
                  cursor: installing ? 'default' : 'pointer',
                  background: colors.brand,
                  color: '#fff',
                  boxShadow: '0 2px 8px rgba(255,122,47,.28)',
                  opacity: installing ? 0.65 : 1,
                }}
              >
                {installing ? '…' : 'Install'}
              </button>
              <span style={{ fontSize: 11, color: colors.sub, lineHeight: 1.3 }}>{fallbackInstallHint()}</span>
            </div>
          ) : null}
        </div>

        {dismissable && (
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            style={{
              flexShrink: 0,
              alignSelf: 'flex-start',
              width: 32,
              height: 32,
              marginLeft: 2,
              marginTop: 0,
              borderRadius: 9,
              background: 'transparent',
              border: 'none',
              color: colors.sub,
              cursor: 'pointer',
              fontSize: 20,
              lineHeight: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
