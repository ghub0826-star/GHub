import React, { useEffect, useState } from 'react';

const REJECT_KEY = 'ghub_pwa_install_dismissed';

/**
 * PWA install button.
 * Shows only if the browser supports beforeinstallprompt and the app
 * is not already installed. Dismissal is remembered for 7 days.
 */
export default function InstallAppButton({ className, children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = (() => {
      try {
        const raw = localStorage.getItem(REJECT_KEY);
        if (!raw) return false;
        const ts = Number(raw);
        return Date.now() - ts < 7 * 24 * 60 * 60 * 1000;
      } catch {
        return false;
      }
    })();

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!dismissed) setVisible(true);
    };

    const onInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!visible || !deferredPrompt) return null;

  const handleInstall = async () => {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    } else {
      try {
        localStorage.setItem(REJECT_KEY, String(Date.now()));
      } catch {
        /* ignore */
      }
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(REJECT_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  return (
    <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
      <button className={className || 'button'} onClick={handleInstall}>
        {children || 'Install Aplikasi'}
      </button>
      <button
        aria-label="Tutup"
        onClick={handleDismiss}
        style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
      >
        ✕
      </button>
    </div>
  );
}
