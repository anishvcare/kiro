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
