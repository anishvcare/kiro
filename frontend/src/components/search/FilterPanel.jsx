import { useDispatch, useSelector } from 'react-redux';
import { setFilters, clearFilters } from '../../store/slices/searchSlice';

const FilterPanel = ({ onApplyFilters }) => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.search);

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handleClearAll = () => {
    dispatch(clearFilters());
    if (onApplyFilters) onApplyFilters({});
  };

  const handleApply = () => {
    if (onApplyFilters) onApplyFilters(filters);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
        <button
          onClick={handleClearAll}
          className="text-xs text-indigo-600 hover:text-indigo-800"
        >
          Clear All
        </button>
      </div>

      {/* Distance Filter */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Distance (km)</label>
        <select
          value={filters.distance || ''}
          onChange={(e) => handleFilterChange('distance', e.target.value || null)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Any distance</option>
          <option value="1">Within 1 km</option>
          <option value="2">Within 2 km</option>
          <option value="5">Within 5 km</option>
          <option value="10">Within 10 km</option>
          <option value="25">Within 25 km</option>
        </select>
      </div>

      {/* Rating Filter */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Minimum Rating</label>
        <select
          value={filters.rating || ''}
          onChange={(e) => handleFilterChange('rating', e.target.value || null)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Any rating</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
          <option value="2">2+ Stars</option>
        </select>
      </div>

      {/* Toggle Filters */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.openNow || false}
            onChange={(e) => handleFilterChange('openNow', e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">Open Now</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.verified || false}
            onChange={(e) => handleFilterChange('verified', e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">Verified Shops</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.deliveryAvailable || false}
            onChange={(e) => handleFilterChange('deliveryAvailable', e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">Delivery Available</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.codAvailable || false}
            onChange={(e) => handleFilterChange('codAvailable', e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">COD Available</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.upiAvailable || false}
            onChange={(e) => handleFilterChange('upiAvailable', e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">UPI Available</span>
        </label>
      </div>

      <button
        onClick={handleApply}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
      >
        Apply Filters
      </button>
    </div>
  );
};

export default FilterPanel;
