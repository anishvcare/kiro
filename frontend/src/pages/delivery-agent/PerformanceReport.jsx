import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDeliveryBoyList,
  fetchDeliveryBoyPerformance,
} from '../../store/slices/deliverySlice';

const PerformanceReport = () => {
  const dispatch = useDispatch();
  const { deliveryBoys, boyPerformance, isLoading } = useSelector((state) => state.delivery);
  const [selectedBoyId, setSelectedBoyId] = useState('');

  useEffect(() => {
    dispatch(fetchDeliveryBoyList());
  }, [dispatch]);

  useEffect(() => {
    if (selectedBoyId) {
      dispatch(fetchDeliveryBoyPerformance(selectedBoyId));
    }
  }, [dispatch, selectedBoyId]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Performance Report</h1>

      {/* Select Delivery Boy */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Delivery Boy</label>
        <select
          value={selectedBoyId}
          onChange={(e) => setSelectedBoyId(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
        >
          <option value="">Choose a delivery boy...</option>
          {deliveryBoys?.map((boy) => (
            <option key={boy.id} value={boy.id}>
              {boy.user?.first_name} {boy.user?.last_name} ({boy.vehicle_type})
            </option>
          ))}
        </select>
      </div>

      {/* Performance Metrics */}
      {selectedBoyId && boyPerformance && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {boyPerformance.deliveryBoy?.user?.first_name} {boyPerformance.deliveryBoy?.user?.last_name}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">
                  {boyPerformance.performance?.totalDeliveries || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total Deliveries</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">
                  {boyPerformance.performance?.todayDeliveries || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Today</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-3xl font-bold text-orange-600">
                  {boyPerformance.performance?.activeDeliveries || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Active Now</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">
                  Rs.{boyPerformance.performance?.totalCashCollected || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Cash Collected</p>
              </div>
            </div>
          </div>

          {/* Boy Details */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Vehicle</p>
                <p className="font-medium">{boyPerformance.deliveryBoy?.vehicle_type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Vehicle Number</p>
                <p className="font-medium">{boyPerformance.deliveryBoy?.vehicle_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Rating</p>
                <p className="font-medium">{boyPerformance.deliveryBoy?.rating || '0.00'} / 5.00</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  boyPerformance.deliveryBoy?.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {boyPerformance.deliveryBoy?.is_available ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedBoyId && isLoading && (
        <div className="text-center py-8 text-gray-500">Loading performance data...</div>
      )}

      {!selectedBoyId && (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center text-gray-500">
          Select a delivery boy to view their performance metrics.
        </div>
      )}
    </div>
  );
};

export default PerformanceReport;
