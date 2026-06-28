import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSearchResults } from '../../store/slices/searchSlice';
import SearchBar from '../../components/search/SearchBar';
import FilterPanel from '../../components/search/FilterPanel';
import ShopCard from '../../components/search/ShopCard';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { results, pagination, isLoading, filters } = useSelector((state) => state.search);
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const query = searchParams.get('q') || '';
  const categoryId = searchParams.get('categoryId') || '';

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          // Location denied - proceed without it
        }
      );
    }
  }, []);

  useEffect(() => {
    performSearch();
  }, [query, categoryId, userLocation]);

  const performSearch = (appliedFilters = filters) => {
    const params = { q: query };

    if (categoryId) params.categoryId = categoryId;
    if (userLocation) {
      params.latitude = userLocation.latitude;
      params.longitude = userLocation.longitude;
    }
    if (appliedFilters.distance) params.radius = appliedFilters.distance;
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
    if (userLocation) {
      params.latitude = userLocation.latitude;
      params.longitude = userLocation.longitude;
    }
    dispatch(fetchSearchResults(params));
  };

  return (
    <div className="space-y-4">
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
        {/* Filter Panel */}
        {showFilters && (
          <div className="w-64 flex-shrink-0">
            <FilterPanel onApplyFilters={handleApplyFilters} />
          </div>
        )}

        {/* Results */}
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
                <ShopCard key={shop.id} shop={shop} />
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
    </div>
  );
};

export default SearchResults;
