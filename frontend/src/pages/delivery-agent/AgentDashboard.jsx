import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchConfirmedRequests,
  fetchActiveDeliveries,
  fetchDeliveryBoyList,
} from '../../store/slices/deliverySlice';
import DeliveryCard from '../../components/delivery/DeliveryCard';

const AgentDashboard = () => {
  const dispatch = useDispatch();
  const { confirmedRequests, activeDeliveries, deliveryBoys, isLoading } = useSelector(
    (state) => state.delivery
  );

  useEffect(() => {
    dispatch(fetchConfirmedRequests());
    dispatch(fetchActiveDeliveries());
    dispatch(fetchDeliveryBoyList());
  }, [dispatch]);

  const availableBoys = deliveryBoys?.filter((b) => b.is_available) || [];
  const busyBoys = deliveryBoys?.filter((b) => !b.is_available) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
        <Link
          to="/delivery-agent/assign"
          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
        >
          Assign Delivery
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Pending Requests</p>
          <p className="text-2xl font-bold text-orange-600">{confirmedRequests?.length || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Active Deliveries</p>
          <p className="text-2xl font-bold text-blue-600">{activeDeliveries?.length || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Available Boys</p>
          <p className="text-2xl font-bold text-green-600">{availableBoys.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Busy Boys</p>
          <p className="text-2xl font-bold text-gray-600">{busyBoys.length}</p>
        </div>
      </div>

      {/* Confirmed Requests */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Confirmed Requests ({confirmedRequests?.length || 0})
        </h2>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : confirmedRequests?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {confirmedRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-semibold">#{request.id?.slice(0, 8)}</h3>
                  <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                    {request.status}
                  </span>
                </div>
                {request.shop && (
                  <p className="text-sm text-gray-600">Shop: {request.shop.name}</p>
                )}
                {request.shop?.address && (
                  <p className="text-xs text-gray-500 mt-1">{request.shop.address}</p>
                )}
                <Link
                  to={`/delivery-agent/assign?request=${request.id}`}
                  className="mt-3 block text-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700"
                >
                  Assign Delivery Boy
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No confirmed requests pending assignment.</p>
        )}
      </div>

      {/* Active Deliveries */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Active Deliveries ({activeDeliveries?.length || 0})
        </h2>
        {activeDeliveries?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeDeliveries.map((delivery) => (
              <DeliveryCard key={delivery.id} delivery={delivery} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No active deliveries.</p>
        )}
      </div>

      {/* Delivery Boy Status Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Delivery Boy Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {deliveryBoys?.map((boy) => (
            <div key={boy.id} className="bg-white rounded-lg shadow-sm border p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {boy.user?.first_name} {boy.user?.last_name}
                </p>
                <p className="text-xs text-gray-500">{boy.vehicle_type} - {boy.vehicle_number || 'N/A'}</p>
              </div>
              <span className={`w-3 h-3 rounded-full ${boy.is_available ? 'bg-green-400' : 'bg-red-400'}`} />
            </div>
          ))}
          {(!deliveryBoys || deliveryBoys.length === 0) && (
            <p className="text-gray-500 text-sm col-span-full">No delivery boys registered.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
