import { useEffect, useState } from 'react';

/**
 * Floating "Install App" button.
 * Captures the browser's beforeinstallprompt event and lets the user install the PWA.
 * (On iOS Safari beforeinstallprompt is unsupported; users install via Share > Add to Home Screen.)
 */
const InstallPWAButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    const installed = () => setVisible(false);
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installed);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);

  if (!visible) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try {
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setVisible(false);
    } catch (e) {
      /* ignore */
    }
    setDeferredPrompt(null);
  };

  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-20 right-4 z-[2000] flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700 transition"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
      </svg>
      <span className="text-sm font-medium">Install App</span>
    </button>
  );
};

export default InstallPWAButton;
