import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDeliveryHistory, fetchEarnings } from '../../store/slices/deliverySlice';

const DeliveryHistory = () => {
  const dispatch = useDispatch();
  const { deliveryHistory, earnings, pagination, isLoading } = useSelector(
    (state) => state.delivery
  );
  const [earningsPeriod, setEarningsPeriod] = useState('today');

  useEffect(() => {
    dispatch(fetchDeliveryHistory({ page: 1, limit: 20 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchEarnings({ period: earningsPeriod }));
  }, [dispatch, earningsPeriod]);

  const handleLoadMore = () => {
    if (pagination && pagination.page < pagination.total_pages) {
      dispatch(fetchDeliveryHistory({ page: pagination.page + 1, limit: 20 }));
    }
  };

  const statusColors = {
    delivered: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    assigned: 'bg-blue-100 text-blue-700',
    picked_up: 'bg-purple-100 text-purple-700',
    in_transit: 'bg-indigo-100 text-indigo-700',
    pending: 'bg-yellow-100 text-yellow-700',
    returned: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Delivery History & Earnings</h1>

      {/* Earnings Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Earnings</h2>
          <select
            value={earningsPeriod}
            onChange={(e) => setEarningsPeriod(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
        {earnings && (
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-green-50 rounded">
              <p className="text-lg font-bold text-green-600">Rs. {earnings.estimated_earnings || 0}</p>
              <p className="text-xs text-gray-500">Earned</p>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded">
              <p className="text-lg font-bold text-blue-600">{earnings.delivery_count || 0}</p>
              <p className="text-xs text-gray-500">Deliveries</p>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded">
              <p className="text-lg font-bold text-orange-600">Rs. {earnings.cash_collected || 0}</p>
              <p className="text-xs text-gray-500">Cash</p>
            </div>
          </div>
        )}
        {earnings && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            Rs. {earnings.per_delivery} per delivery
          </p>
        )}
      </div>

      {/* Delivery History */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h2 className="text-sm font-medium text-gray-700">
            Past Deliveries ({pagination?.total || 0})
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {deliveryHistory?.map((delivery) => (
            <div key={delivery.id} className="px-4 py-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900">#{delivery.id?.slice(0, 8)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {delivery.pickup_address || 'Pickup'} → {delivery.delivery_address || 'Delivery'}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[delivery.status] || 'bg-gray-100 text-gray-700'}`}>
                  {delivery.status}
                </span>
              </div>
              {delivery.actual_delivery_time && (
                <p className="text-xs text-gray-400 mt-1">
                  Delivered: {new Date(delivery.actual_delivery_time).toLocaleString()}
                </p>
              )}
            </div>
          ))}
          {(!deliveryHistory || deliveryHistory.length === 0) && (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              {isLoading ? 'Loading...' : 'No delivery history found.'}
            </div>
          )}
        </div>
        {pagination && pagination.page < pagination.total_pages && (
          <div className="px-4 py-3 border-t text-center">
            <button
              onClick={handleLoadMore}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryHistory;
