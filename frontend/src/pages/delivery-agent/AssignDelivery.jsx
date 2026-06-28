import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  fetchConfirmedRequests,
  fetchDeliveryBoyList,
  assignDeliveryBoy,
  reassignDeliveryBoyThunk,
  clearError,
  clearSuccess,
} from '../../store/slices/deliverySlice';

const AssignDelivery = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedRequest = searchParams.get('request');

  const { confirmedRequests, deliveryBoys, isLoading, error, successMessage } = useSelector(
    (state) => state.delivery
  );

  const [selectedRequest, setSelectedRequest] = useState(preselectedRequest || '');
  const [selectedBoy, setSelectedBoy] = useState('');

  useEffect(() => {
    dispatch(fetchConfirmedRequests());
    dispatch(fetchDeliveryBoyList());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
        navigate('/delivery-agent');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch, navigate]);

  const handleAssign = () => {
    if (!selectedRequest || !selectedBoy) return;

    dispatch(assignDeliveryBoy({
      request_id: selectedRequest,
      delivery_boy_id: selectedBoy,
    }));
  };

  const availableBoys = deliveryBoys?.filter((b) => b.is_available && b.is_active) || [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Assign Delivery</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
          <button onClick={() => dispatch(clearError())} className="ml-2 text-red-500 underline text-sm">Dismiss</button>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
        {/* Select Request */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Request
          </label>
          <select
            value={selectedRequest}
            onChange={(e) => setSelectedRequest(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Choose a request...</option>
            {confirmedRequests?.map((req) => (
              <option key={req.id} value={req.id}>
                #{req.id?.slice(0, 8)} - {req.shop?.name || 'Unknown Shop'} ({req.status})
              </option>
            ))}
          </select>
        </div>

        {/* Select Delivery Boy */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Delivery Boy
          </label>
          {availableBoys.length > 0 ? (
            <div className="space-y-2">
              {availableBoys.map((boy) => (
                <label
                  key={boy.id}
                  className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedBoy === boy.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery_boy"
                    value={boy.id}
                    checked={selectedBoy === boy.id}
                    onChange={(e) => setSelectedBoy(e.target.value)}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {boy.user?.first_name} {boy.user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {boy.vehicle_type} | Rating: {boy.rating || 'N/A'} | Deliveries: {boy.total_deliveries || 0}
                    </p>
                  </div>
                  <span className="ml-auto w-2.5 h-2.5 rounded-full bg-green-400" />
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">
              No delivery boys available at the moment.
            </p>
          )}
        </div>

        {/* Assign Button */}
        <button
          onClick={handleAssign}
          disabled={!selectedRequest || !selectedBoy || isLoading}
          className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Assigning...' : 'Assign Delivery Boy'}
        </button>
      </div>
    </div>
  );
};

export default AssignDelivery;
