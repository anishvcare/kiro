import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPopularSearches } from '../../store/slices/searchSlice';
import SearchBar from '../../components/search/SearchBar';
import CategoryGrid from '../../components/search/CategoryGrid';
import NearbyShops from '../../components/search/NearbyShops';

const CustomerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { popularSearches } = useSelector((state) => state.search);

  useEffect(() => {
    dispatch(fetchPopularSearches());
  }, [dispatch]);

  const handleSearch = (query) => {
    navigate(`/customer/search?q=${encodeURIComponent(query)}`);
  };

  const handleCategorySelect = (category) => {
    navigate(`/customer/search?categoryId=${category.id || ''}&q=${encodeURIComponent(category.name)}`);
  };

  return (
    <div className="space-y-6">
      {/* Hero Section with Search */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Find Local Shops</h1>
        <p className="text-indigo-100 text-sm mb-4">
          Search for products, shops, or categories near you
        </p>
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/customer/requests')}
          className="flex items-center gap-3 bg-white rounded-lg shadow-sm border p-4 hover:shadow-md hover:border-indigo-300 transition text-left"
        >
          <span className="p-2 rounded-full bg-indigo-100">
            <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-900">My Requests</p>
            <p className="text-xs text-gray-500">View your orders &amp; quotations</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/customer/search')}
          className="flex items-center gap-3 bg-white rounded-lg shadow-sm border p-4 hover:shadow-md hover:border-indigo-300 transition text-left"
        >
          <span className="p-2 rounded-full bg-purple-100">
            <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-900">Browse Shops</p>
            <p className="text-xs text-gray-500">Search all local shops</p>
          </div>
        </button>
      </div>

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
    </div>
  );
};

export default CustomerDashboard;
