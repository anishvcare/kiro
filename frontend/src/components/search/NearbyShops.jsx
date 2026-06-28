import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNearbyShops } from '../../store/slices/searchSlice';
import ShopCard from './ShopCard';

const NearbyShops = () => {
  const dispatch = useDispatch();
  const { nearbyShops, isLoading } = useSelector((state) => state.search);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          dispatch(fetchNearbyShops({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            radius: 5,
          }));
        },
        () => {
          setLocationError('Location access denied. Enable location to see nearby shops.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }
  }, [dispatch]);

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Nearby Shops</h2>

      {locationError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-yellow-700">{locationError}</p>
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
