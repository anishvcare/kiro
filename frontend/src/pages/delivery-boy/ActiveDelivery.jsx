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
import { mediaUrl } from '../../utils/media';

// Bill thumbnail that gracefully falls back to a "View Bill" placeholder when
// the image can't load (e.g. the uploaded file is missing/expired on the
// server). The placeholder is still tappable to open the bill in a new tab.
const BillThumb = ({ url }) => {
  const [errored, setErrored] = useState(false);
  if (!url) return null;
  const src = mediaUrl(url);
  return (
    <a href={src} target="_blank" rel="noopener noreferrer" className="inline-block">
      {errored ? (
        <div className="w-28 h-28 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V18a2 2 0 01-2 2z" />
          </svg>
          <span className="text-[11px] font-medium mt-1 text-blue-600">View Bill</span>
        </div>
      ) : (
        <img
          src={src}
          alt="Bill"
          onError={() => setErrored(true)}
          className="w-28 h-28 object-cover rounded-lg border"
        />
      )}
    </a>
  );
};

// Small helper: a Call / Directions action row for a contact + location.
const fmtName = (u) => (u ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : '');
const directionsUrl = (lat, lng, address) => {
  if (lat != null && lng != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
  if (address) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  return null;
};

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

  // Derive full order details from the enriched assignment.
  const req = delivery?.request || {};
  const shop = req.shop || {};
  const shopOwner = shop.owner || {};
  const customer = req.customer || {};
  const customerUser = customer.user || {};
  const quotation = (req.quotations || []).find((q) => q.status === 'accepted') || (req.quotations || [])[0] || null;
  const items = (quotation && quotation.items) || [];
  const paymentMethod = (delivery?.transaction?.payment_method) || (quotation && quotation.payment_method) || 'upi';
  const shopPhone = shopOwner.phone || shop.phone;
  const customerName = fmtName(customerUser) || 'Customer';
  const customerPhone = customerUser.phone;
  const custDirUrl = directionsUrl(delivery?.delivery_latitude, delivery?.delivery_longitude, delivery?.delivery_address);
  const shopDirUrl = directionsUrl(shop.latitude, shop.longitude, shop.address || delivery?.pickup_address);
  const num = (v) => parseFloat(v || 0);

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
          {/* Order Details (single unified card) */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Order Details</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase">
                  {paymentMethod === 'cod' ? 'COD' : 'UPI'}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-semibold text-gray-900">#{delivery.id?.slice(0, 8)}</span>
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                  {delivery.status?.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Store details */}
            <div className="px-4 py-3 border-b">
              <p className="text-xs text-gray-400 uppercase mb-1">Store Details</p>
              <p className="text-base font-semibold text-gray-900">{shop.name || 'Shop'}</p>
              {shopPhone ? (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-gray-800">{shopPhone}</span>
                  <a
                    href={`tel:${shopPhone}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md px-3 py-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    Call
                  </a>
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-1">Phone not available</p>
              )}
              <p className="text-xs text-gray-500 mt-1">{shop.address || delivery.pickup_address}</p>
              {shopDirUrl && (
                <a href={shopDirUrl} target="_blank" rel="noopener noreferrer" className="block text-center text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md py-1.5 mt-2">Directions</a>
              )}
            </div>

            {/* Customer details */}
            <div className="px-4 py-3 border-b">
              <p className="text-xs text-gray-400 uppercase mb-1">Customer Contact Details</p>
              <p className="text-base font-semibold text-gray-900">{customerName}</p>
              {customerPhone ? (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-gray-800">{customerPhone}</span>
                  <a
                    href={`tel:${customerPhone}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md px-3 py-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    Call
                  </a>
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-1">Phone not available</p>
              )}
              <p className="text-xs text-gray-500 mt-1">{delivery.delivery_address || customer.default_address}</p>
              {custDirUrl && (
                <a href={custDirUrl} target="_blank" rel="noopener noreferrer" className="block text-center text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md py-1.5 mt-2">Directions</a>
              )}
            </div>

            {/* What the customer ordered */}
            {req.request_text && (
              <div className="px-4 py-3 border-b">
                <p className="text-xs text-gray-400 uppercase mb-1">Order</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{req.request_text}</p>
              </div>
            )}

            {/* Itemized list (if the shop added items) */}
            {items.length > 0 && (
              <div className="px-4 py-3 border-b space-y-2">
                {items.map((it) => (
                  <div key={it.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {it.item_name}
                      <span className="text-gray-400"> x{it.quantity || 1}{it.unit ? ` ${it.unit}` : ''}</span>
                    </span>
                    <span className="text-gray-800">&#8377;{num(it.total_price || it.unit_price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Bill photo */}
            {quotation && quotation.bill_image_url && (
              <div className="px-4 py-3 border-b">
                <p className="text-xs text-gray-400 uppercase mb-2">Bill</p>
                <div className="flex items-start gap-3">
                  <BillThumb url={quotation.bill_image_url} />
                  <a
                    href={mediaUrl(quotation.bill_image_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-3 py-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Bill
                  </a>
                </div>
              </div>
            )}

            {/* Bill summary */}
            {quotation && (
              <div className="px-4 py-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Bill Amount</span>
                  <span>&#8377;{num(quotation.total_amount).toFixed(2)}</span>
                </div>
                {num(quotation.delivery_charge) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery Charge</span>
                    <span>&#8377;{num(quotation.delivery_charge).toFixed(2)}</span>
                  </div>
                )}
                {num(quotation.approx_weight) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Approx. Weight</span>
                    <span>{num(quotation.approx_weight).toFixed(2)} kg</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-base pt-1 border-t">
                  <span>Total {paymentMethod === 'cod' ? '(Collect)' : ''}</span>
                  <span className="text-blue-700">&#8377;{num(quotation.final_amount).toFixed(2)}</span>
                </div>
              </div>
            )}
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
