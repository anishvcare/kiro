import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, Sun, Moon, Home, Grid3X3, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useStore } from '../../context/StoreContext';
import InstallPWA from '../pwa/InstallPWA';

const StoreLayout = ({ children, title, showBack = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { getTotalItems } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const { getSetting } = useStore();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700">
        <div className="page-container">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left */}
            <div className="flex items-center gap-2">
              {showBack ? (
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <ArrowLeft size={22} />
                </button>
              ) : (
                <button onClick={() => setMenuOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden">
                  <Menu size={22} />
                </button>
              )}
              <Link to="/" className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold text-primary-900 dark:text-white">
                  {getSetting('store_name', 'RetailShop')}
                </span>
              </Link>
            </div>

            {/* Title (mobile) */}
            {title && (
              <h1 className="absolute left-1/2 transform -translate-x-1/2 text-base font-semibold text-primary-900 dark:text-white sm:hidden">
                {title}
              </h1>
            )}

            {/* Right */}
            <div className="flex items-center gap-1">
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <Search size={20} />
              </button>
              <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <Link to="/cart" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative">
                <ShoppingCart size={20} />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-accent text-primary-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border-t border-gray-100 dark:border-gray-700 p-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="input-field flex-1"
                autoFocus
              />
              <button type="submit" className="btn-primary px-4">
                <Search size={18} />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <span className="text-xl font-bold dark:text-white">{getSetting('store_name', 'RetailShop')}</span>
              <button onClick={() => setMenuOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={20} />
              </button>
            </div>
            <nav className="space-y-1">
              <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-base font-medium">
                <Home size={20} /> Home
              </Link>
              <Link to="/products" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-base font-medium">
                <Grid3X3 size={20} /> All Products
              </Link>
              <Link to="/cart" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-base font-medium">
                <ShoppingCart size={20} /> Cart ({getTotalItems()})
              </Link>
            </nav>
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <InstallPWA />
            </div>
          </div>
        </div>
      )}

      {/* Floating Install App Button */}
      <InstallPWA variant="floating" />

      {/* Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-30 safe-bottom sm:hidden">
        <div className="flex items-center justify-around h-16">
          <Link to="/" className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-primary-900 dark:hover:text-white">
            <Home size={20} />
            <span>Home</span>
          </Link>
          <Link to="/products" className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-primary-900 dark:hover:text-white">
            <Grid3X3 size={20} />
            <span>Shop</span>
          </Link>
          <Link to="/cart" className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-primary-900 dark:hover:text-white relative">
            <ShoppingCart size={20} />
            <span>Cart</span>
            {getTotalItems() > 0 && (
              <span className="absolute -top-0.5 right-1 bg-accent text-primary-900 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default StoreLayout;
