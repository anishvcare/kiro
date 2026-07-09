import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  fetchAssignedDeliveries,
  acceptDeliveryThunk,
  rejectDeliveryThunk,
  markReachedShopThunk,
  markPickedUpThunk,
  markOutForDeliveryThunk,
  markReachedCustomerThunk,
  markDeliveredThunk,
  setCurrentDelivery,
  clearError,
  clearSuccess,
} from '../../store/slices/deliverySlice';
import LocationUpdater from '../../components/map/LocationUpdater';
import LiveTrackingMap from '../../components/map/LiveTrackingMap';

const DELIVERY_STEPS = [
  { key: 'assigned', label: 'Accepted', action: null },
  { key: 'reached_shop', label: 'Reached Shop', action: 'markReachedShop' },
  { key: 'picked_up', label: 'Picked Up', action: 'markPickedUp' },
  { key: 'out_for_delivery', label: 'Out For Delivery', action: 'markOutForDelivery' },
  { key: 'reached_customer', label: 'Reached Customer', action: 'markReachedCustomer' },
  { key: 'delivered', label: 'Delivered', action: 'markDelivered' },
];

// Coarse ENUM status -> step index (fallback when delivery_step is absent).
const statusToStepIndex = {
  'pending': -1,
  'assigned': 0,
  'picked_up': 2,
  'in_transit': 3,
  'delivered': 5,
};

// Fine-grained delivery_step -> step index (primary source of truth).
const stepToIndex = {
  'assigned': 0,
  'reached_shop': 1,
  'picked_up': 2,
  'out_for_delivery': 3,
  'reached_customer': 4,
  'delivered': 5,
};

const ActiveDelivery = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deliveryId = searchParams.get('id');

  const { assignedDeliveries, currentDelivery, isLoading, error, successMessage } = useSelector(
    (state) => state.delivery
  );
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [busy, setBusy] = useState(false); // dedicated loading for step actions

  useEffect(() => {
    if (!assignedDeliveries || assignedDeliveries.length === 0) {
      dispatch(fetchAssignedDeliveries());
    }
  }, [dispatch, assignedDeliveries]);

  useEffect(() => {
    if (deliveryId && assignedDeliveries?.length > 0) {
      const delivery = assignedDeliveries.find((d) => d.id === deliveryId);
      if (delivery) {
        dispatch(setCurrentDelivery(delivery));
      }
    }
  }, [deliveryId, assignedDeliveries, dispatch]);

  const delivery = currentDelivery || (deliveryId && assignedDeliveries?.find((d) => d.id === deliveryId));
  const currentStepIdx = delivery
    ? (stepToIndex[delivery.delivery_step] ?? statusToStepIndex[delivery.status] ?? 0)
    : -1;

  const runAction = async (thunkPromise) => {
    setBusy(true);
    try {
      await thunkPromise;
    } finally {
      setBusy(false);
    }
  };

  const handleAction = (step) => {
    if (!delivery || busy) return;
    const actions = {
      markReachedShop: () => dispatch(markReachedShopThunk(delivery.id)),
      markPickedUp: () => dispatch(markPickedUpThunk(delivery.id)),
      markOutForDelivery: () => dispatch(markOutForDeliveryThunk(delivery.id)),
      markReachedCustomer: () => dispatch(markReachedCustomerThunk(delivery.id)),
      markDelivered: () => dispatch(markDeliveredThunk(delivery.id)),
    };
    if (actions[step.action]) {
      runAction(actions[step.action]());
    }
  };

  const handleAccept = () => {
    if (delivery && !busy) runAction(dispatch(acceptDeliveryThunk(delivery.id)));
  };

  const handleReject = () => {
    if (delivery) {
      dispatch(rejectDeliveryThunk({ assignmentId: delivery.id, reason: rejectReason }));
      setShowReject(false);
      navigate('/delivery-boy');
    }
  };

  const getNextStep = () => {
    const nextIdx = currentStepIdx + 1;
    if (nextIdx < DELIVERY_STEPS.length) return DELIVERY_STEPS[nextIdx];
    return null;
  };

  if (!delivery && !isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No active delivery selected.</p>
        <button
          onClick={() => navigate('/delivery-boy')}
          className="mt-4 text-blue-600 text-sm underline"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const nextStep = getNextStep();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Active Delivery</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {error}
          <button onClick={() => dispatch(clearError())} className="ml-2 underline text-xs">Dismiss</button>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-sm">
          {successMessage}
        </div>
      )}

      {delivery && (
        <>
          {/* Delivery Info */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex justify-between items-start">
              <h2 className="text-sm font-semibold text-gray-900">#{delivery.id?.slice(0, 8)}</h2>
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                {delivery.status?.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              {delivery.pickup_address && (
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Pickup</p>
                    <p className="text-gray-700">{delivery.pickup_address}</p>
                  </div>
                </div>
              )}
              {delivery.delivery_address && (
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Delivery</p>
                    <p className="text-gray-700">{delivery.delivery_address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Live location sharing + map (while actively delivering) */}
          {delivery.status !== 'pending' && delivery.status !== 'delivered' && (
            <>
              <LocationUpdater assignmentId={delivery.id} />
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="h-72 w-full">
                  <LiveTrackingMap assignmentId={delivery.id} />
                </div>
              </div>
            </>
          )}

          {/* Step Progress */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Delivery Progress</h3>
            <div className="space-y-3">
              {DELIVERY_STEPS.map((step, idx) => (
                <div key={step.key} className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 ${
                    idx <= currentStepIdx ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {idx <= currentStepIdx ? (
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span className={`text-sm ${idx <= currentStepIdx ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {delivery.status === 'pending' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAccept}
                  disabled={busy}
                  className="px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-300"
                >
                  Accept
                </button>
                <button
                  onClick={() => setShowReject(true)}
                  disabled={busy}
                  className="px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-300"
                >
                  Reject
                </button>
              </div>
            )}

            {nextStep && delivery.status !== 'pending' && delivery.status !== 'delivered' && (
              <button
                onClick={() => handleAction(nextStep)}
                disabled={busy}
                className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
              >
                {busy ? 'Updating...' : nextStep.label}
              </button>
            )}

            {delivery.status === 'delivered' && (
              <div className="text-center py-4">
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Delivery Completed
                </div>
              </div>
            )}

            {/* Links to cash collection and proof */}
            {(delivery.status === 'in_transit' || delivery.status === 'delivered') && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate(`/delivery-boy/cash-collection?id=${delivery.id}`)}
                  className="px-3 py-2 bg-orange-100 text-orange-700 text-sm font-medium rounded-lg hover:bg-orange-200"
                >
                  Cash Collection
                </button>
                <button
                  onClick={() => navigate(`/delivery-boy/proof?id=${delivery.id}`)}
                  className="px-3 py-2 bg-purple-100 text-purple-700 text-sm font-medium rounded-lg hover:bg-purple-200"
                >
                  Upload Proof
                </button>
              </div>
            )}
          </div>

          {/* Reject Dialog */}
          {showReject && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Reject Delivery</h3>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection (optional)"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-4"
                  rows={3}
                />
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowReject(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ActiveDelivery;
