/**
 * Public Search Results Page (no authentication required)
 * Guests can browse search results. Action buttons prompt login.
 */

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSearchResults } from '../../store/slices/searchSlice';
import SearchBar from '../../components/search/SearchBar';
import FilterPanel from '../../components/search/FilterPanel';

const PublicShopCard = ({ shop }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4">
      <div className="flex items-start gap-4">
        {/* Shop Logo */}
        <div className="flex-shrink-0">
          {shop.logo_url ? (
            <img
              src={shop.logo_url}
              alt={shop.name}
              className="w-16 h-16 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-bold text-xl">
                {shop.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Shop Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{shop.name}</h3>
            {shop.is_verified && (
              <svg className="h-4 w-4 text-blue-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          {shop.category && (
            <p className="text-xs text-gray-500 mt-0.5">{shop.category.name}</p>
          )}

          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-xs">
              <svg className="h-3.5 w-3.5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-gray-700 font-medium">{parseFloat(shop.rating || 0).toFixed(1)}</span>
            </span>

            {shop.distance !== undefined && (
              <span className="text-xs text-gray-500">{shop.distance} km away</span>
            )}

            <span className={`text-xs font-medium ${shop.isOpen ? 'text-green-600' : 'text-red-500'}`}>
              {shop.isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>

        {/* View Button */}
        <button
          onClick={() => navigate(`/explore/shop/${shop.id}`)}
          className="px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
        >
          View Shop
        </button>
      </div>
    </div>
  );
};

const PublicSearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { results, pagination, isLoading, filters } = useSelector((state) => state.search);
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const query = searchParams.get('q') || '';
  const categoryId = searchParams.get('categoryId') || '';

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    performSearch();
  }, [query, categoryId, userLocation]);

  const performSearch = (appliedFilters = filters) => {
    const params = { q: query };
    if (categoryId) params.categoryId = categoryId;
    if (appliedFilters.distance && userLocation) {
      params.latitude = userLocation.latitude;
      params.longitude = userLocation.longitude;
      params.radius = appliedFilters.distance;
    }
    if (appliedFilters.rating) params.rating = appliedFilters.rating;
    if (appliedFilters.openNow) params.openNow = 'true';
    if (appliedFilters.verified) params.verified = 'true';
    dispatch(fetchSearchResults(params));
  };

  const handleSearch = (newQuery) => {
    setSearchParams({ q: newQuery });
  };

  const handleApplyFilters = (appliedFilters) => {
    performSearch(appliedFilters);
    setShowFilters(false);
  };

  const handlePageChange = (page) => {
    const params = { q: query, page };
    if (categoryId) params.categoryId = categoryId;
    if (filters.distance && userLocation) {
      params.latitude = userLocation.latitude;
      params.longitude = userLocation.longitude;
      params.radius = filters.distance;
    }
    dispatch(fetchSearchResults(params));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/" className="text-lg font-bold text-indigo-600">
            LocalShop
          </Link>
          <div className="flex items-center space-x-3">
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
          </div>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-4">
        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} />

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {isLoading
              ? 'Searching...'
              : `${pagination?.total || results.length} shop${(pagination?.total || results.length) !== 1 ? 's' : ''} found`}
            {query && <span className="font-medium"> for &quot;{query}&quot;</span>}
          </p>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
        </div>

        <div className="flex gap-4">
          {showFilters && (
            <div className="w-64 flex-shrink-0">
              <FilterPanel onApplyFilters={handleApplyFilters} />
            </div>
          )}

          <div className="flex-1">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-24" />
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-3">
                {results.map((shop) => (
                  <PublicShopCard key={shop.id} shop={shop} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No shops found</h3>
                <p className="mt-1 text-sm text-gray-500">Try a different search term or adjust your filters.</p>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicSearchResults;
