import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDeliveryBoyList,
  fetchDeliveryBoyPerformance,
} from '../../store/slices/deliverySlice';

const DeliveryBoyManagement = () => {
  const dispatch = useDispatch();
  const { deliveryBoys, boyPerformance, isLoading } = useSelector((state) => state.delivery);
  const [selectedBoy, setSelectedBoy] = useState(null);

  useEffect(() => {
    dispatch(fetchDeliveryBoyList());
  }, [dispatch]);

  const handleViewPerformance = (boy) => {
    setSelectedBoy(boy);
    dispatch(fetchDeliveryBoyPerformance(boy.id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Delivery Boy Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h2 className="text-sm font-medium text-gray-700">All Delivery Boys ({deliveryBoys?.length || 0})</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {deliveryBoys?.map((boy) => (
                <div key={boy.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <span className={`w-3 h-3 rounded-full ${boy.is_available ? 'bg-green-400' : 'bg-red-400'}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {boy.user?.first_name} {boy.user?.last_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {boy.vehicle_type} | {boy.user?.phone || 'No phone'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Deliveries: {boy.total_deliveries || 0}</p>
                      <p className="text-xs text-gray-500">Rating: {boy.rating || '0.00'}</p>
                    </div>
                    <button
                      onClick={() => handleViewPerformance(boy)}
                      className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
              {(!deliveryBoys || deliveryBoys.length === 0) && (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  No delivery boys found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Details */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Performance Details</h2>
            {selectedBoy && boyPerformance ? (
              <div className="space-y-3">
                <div className="text-center pb-3 border-b">
                  <p className="font-semibold text-gray-900">
                    {boyPerformance.deliveryBoy?.user?.first_name} {boyPerformance.deliveryBoy?.user?.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{boyPerformance.deliveryBoy?.user?.phone}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="text-lg font-bold text-blue-600">{boyPerformance.performance?.totalDeliveries || 0}</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <p className="text-lg font-bold text-green-600">{boyPerformance.performance?.todayDeliveries || 0}</p>
                    <p className="text-xs text-gray-500">Today</p>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded">
                    <p className="text-lg font-bold text-orange-600">{boyPerformance.performance?.activeDeliveries || 0}</p>
                    <p className="text-xs text-gray-500">Active</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <p className="text-lg font-bold text-purple-600">Rs.{boyPerformance.performance?.totalCashCollected || 0}</p>
                    <p className="text-xs text-gray-500">Cash</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Select a delivery boy to view performance.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryBoyManagement;
