/**
 * Public Landing Page (HomePage)
 * This is the first page users see. It shows a customer-facing interface
 * with search, categories, and nearby shops. All users (including guests)
 * can browse. Login/Register option is prominently displayed.
 * Authenticated users are shown their role-specific navigation.
 */

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPopularSearches, fetchSearchResults, fetchCategories } from '../store/slices/searchSlice';
import SearchBar from '../components/search/SearchBar';
import CategoryGrid from '../components/search/CategoryGrid';
import NearbyShops from '../components/search/NearbyShops';
import { getRoleHome } from '../utils/roleRedirect';

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { popularSearches } = useSelector((state) => state.search);

  useEffect(() => {
    dispatch(fetchPopularSearches());
  }, [dispatch]);

  const handleSearch = (query) => {
    if (isAuthenticated) {
      navigate(`/customer/search?q=${encodeURIComponent(query)}`);
    } else {
      navigate(`/explore/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleCategorySelect = (category) => {
    if (isAuthenticated) {
      navigate(`/customer/search?categoryId=${category.id || ''}&q=${encodeURIComponent(category.name)}`);
    } else {
      navigate(`/explore/search?categoryId=${category.id || ''}&q=${encodeURIComponent(category.name)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/" className="text-lg font-bold text-indigo-600">
            LocalShop
          </Link>
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-700">
                  Hi, {user?.first_name || 'User'}
                </span>
                <Link
                  to={getRoleHome(user)}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-4xl mx-auto space-y-6">
        {/* Hero Section with Search */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Find Local Shops Near You</h1>
          <p className="text-indigo-100 text-sm mb-4">
            Search for products, shops, or categories. Send enquiries and get quotations from local shops.
          </p>
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* How It Works - for guests */}
        {!isAuthenticated && (
          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">1</div>
                <p className="text-xs text-gray-600 mt-2 font-medium">Search for shops</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">2</div>
                <p className="text-xs text-gray-600 mt-2 font-medium">Send an enquiry</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">3</div>
                <p className="text-xs text-gray-600 mt-2 font-medium">Get quotation & pay</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">4</div>
                <p className="text-xs text-gray-600 mt-2 font-medium">Receive delivery</p>
              </div>
            </div>
          </div>
        )}

        {/* Popular Searches */}
        {popularSearches && popularSearches.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-2">Popular Searches</h2>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(search)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category Grid */}
        <CategoryGrid onCategorySelect={handleCategorySelect} />

        {/* Nearby Shops */}
        <NearbyShops />

        {/* CTA for guests */}
        {!isAuthenticated && (
          <div className="bg-indigo-50 rounded-lg p-6 text-center border border-indigo-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to get started?
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Create an account to send requests, chat with shops, and track deliveries.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                to="/register"
                className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Account
              </Link>
              <Link
                to="/login"
                className="px-6 py-2.5 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
