const LoadingSpinner = ({ fullScreen = false, size = 'md' }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50">
        <div className={`${sizes[size]} border-4 border-gray-200 dark:border-gray-700 border-t-accent rounded-full animate-spin`}></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      <div className={`${sizes[size]} border-4 border-gray-200 dark:border-gray-700 border-t-accent rounded-full animate-spin`}></div>
    </div>
  );
};

export default LoadingSpinner;
