import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  toggleOnlineStatus,
  fetchAssignedDeliveries,
  fetchDailyDeliveries,
} from '../../store/slices/deliverySlice';

const BoyDashboard = () => {
  const dispatch = useDispatch();
  const { isOnline, assignedDeliveries, dailyStats, isLoading } = useSelector(
    (state) => state.delivery
  );

  useEffect(() => {
    dispatch(fetchAssignedDeliveries());
    dispatch(fetchDailyDeliveries());
  }, [dispatch]);

  const handleToggleStatus = () => {
    dispatch(toggleOnlineStatus(!isOnline));
  };

  return (
    <div className="space-y-4">
      {/* Online/Offline Toggle */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Your Status</h2>
            <p className="text-sm text-gray-500">
              {isOnline ? 'You are online and accepting deliveries' : 'You are offline'}
            </p>
          </div>
          <button
            onClick={handleToggleStatus}
            disabled={isLoading}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              isOnline ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow ${
                isOnline ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Daily Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{dailyStats?.stats?.count || 0}</p>
          <p className="text-xs text-gray-500">Today&apos;s Deliveries</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            Rs. {dailyStats?.stats?.cash_collected || 0}
          </p>
          <p className="text-xs text-gray-500">Cash Collected</p>
        </div>
      </div>

      {/* Active Delivery */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Active Deliveries ({assignedDeliveries?.length || 0})
        </h2>
        {assignedDeliveries?.length > 0 ? (
          <div className="space-y-3">
            {assignedDeliveries.map((delivery) => (
              <Link
                key={delivery.id}
                to={`/delivery-boy/active?id=${delivery.id}`}
                className="block bg-white rounded-lg shadow-sm border p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      #{delivery.id?.slice(0, 8)}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {delivery.pickup_address || 'Pickup address'}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    delivery.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                    delivery.status === 'picked_up' ? 'bg-purple-100 text-purple-700' :
                    delivery.status === 'in_transit' ? 'bg-indigo-100 text-indigo-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {delivery.status?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {delivery.delivery_address || 'Delivery address'}
                </div>
                <p className="mt-2 text-xs text-blue-600 font-medium">Tap to view details</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">No active deliveries</p>
            <p className="text-xs text-gray-400">New deliveries will appear here when assigned</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoyDashboard;
