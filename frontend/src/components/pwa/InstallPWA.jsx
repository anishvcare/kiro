import { useState, useEffect } from 'react';
import { Download, Smartphone } from 'lucide-react';

const InstallPWA = ({ variant = 'default' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstall(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstall(false);
    }
    setDeferredPrompt(null);
  };

  if (!showInstall) return null;

  // Banner variant - shows as a prominent banner on homepage
  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-primary-900 to-primary-700 dark:from-accent dark:to-accent-600 rounded-2xl p-5 text-white dark:text-primary-900">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Smartphone size={28} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">Download Our App</h3>
            <p className="text-sm opacity-90 mt-0.5">Install for faster access, offline browsing & instant notifications</p>
          </div>
          <button
            onClick={handleInstall}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent dark:bg-primary-900 text-primary-900 dark:text-white font-semibold rounded-xl active:scale-95 transition-all whitespace-nowrap"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Install</span>
          </button>
        </div>
      </div>
    );
  }

  // Floating variant - shows as floating button
  if (variant === 'floating') {
    return (
      <button
        onClick={handleInstall}
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 px-4 py-3 bg-accent hover:bg-accent-500 text-primary-900 font-semibold rounded-full shadow-lg shadow-accent/30 active:scale-95 transition-all animate-bounce"
        style={{ animationDuration: '2s', animationIterationCount: '3' }}
      >
        <Download size={18} />
        <span className="text-sm">Install App</span>
      </button>
    );
  }

  // Default variant - simple button (for sidebar menu)
  return (
    <button
      onClick={handleInstall}
      className="flex items-center gap-2 w-full px-4 py-3 bg-accent/10 hover:bg-accent/20 text-accent-700 dark:text-accent-400 rounded-xl font-medium transition-colors"
    >
      <Download size={18} />
      <span>Install App</span>
    </button>
  );
};

export default InstallPWA;
