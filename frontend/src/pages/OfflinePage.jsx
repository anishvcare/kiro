import { WifiOff } from 'lucide-react';

const OfflinePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center">
        <WifiOff size={64} className="mx-auto text-gray-400 dark:text-gray-500 mb-6" />
        <h1 className="text-2xl font-bold dark:text-white mb-2">You're Offline</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
          Please check your internet connection and try again. Some features may be unavailable while offline.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default OfflinePage;
