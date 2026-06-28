import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNearbyShops } from '../../store/slices/searchSlice';
import ShopCard from './ShopCard';

const NearbyShops = () => {
  const dispatch = useDispatch();
  const { nearbyShops, isLoading } = useSelector((state) => state.search);
  const [locationError, setLocationError] = useState(null);
  const [locating, setLocating] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        dispatch(fetchNearbyShops({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          radius: 10,
        }));
      },
      (err) => {
        setLocating(false);
        setLocationError(
          err.code === 1
            ? 'Location permission denied. Please allow location access in your browser settings, then tap "Enable Location".'
            : 'Could not get your location. Tap "Enable Location" to retry.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [dispatch]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">Nearby Shops</h2>
        <button
          onClick={requestLocation}
          disabled={locating}
          className="flex items-center gap-1 text-sm text-indigo-600 font-medium hover:text-indigo-700 disabled:opacity-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {locating ? 'Locating...' : 'Enable Location'}
        </button>
      </div>

      {locationError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3 flex items-center justify-between gap-2">
          <p className="text-sm text-yellow-700">{locationError}</p>
          <button
            onClick={requestLocation}
            className="shrink-0 px-3 py-1.5 text-xs font-medium bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            Enable Location
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-24" />
          ))}
        </div>
      ) : nearbyShops.length > 0 ? (
        <div className="space-y-3">
          {nearbyShops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      ) : !locationError ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No shops found nearby. Try increasing the search radius.</p>
        </div>
      ) : null}
    </div>
  );
};

export default NearbyShops;
