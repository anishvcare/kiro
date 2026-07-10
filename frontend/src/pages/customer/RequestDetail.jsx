import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRequestDetails, cancelRequest } from '../../store/slices/requestSlice';
import { acceptQuotation, rejectQuotation } from '../../store/slices/quotationSlice';
import StatusTimeline from '../../components/request/StatusTimeline';
import QuotationCard from '../../components/quotation/QuotationCard';

const RequestDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentRequest, timeline, isLoading, error } = useSelector((state) => state.request);
  const { isLoading: quotationLoading } = useSelector((state) => state.quotation);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchRequestDetails(id));
    // Poll so the Status Timeline advances live as the delivery boy progresses
    // through each step (Reached Shop, Picked Up, ... Delivered).
    const timer = setInterval(() => {
      dispatch(fetchRequestDetails(id));
    }, 10000);
    return () => clearInterval(timer);
  }, [dispatch, id]);

  const handleAcceptQuotation = async (quotationId) => {
    if (window.confirm('Are you sure you want to accept this quotation?')) {
      await dispatch(acceptQuotation(quotationId));
      dispatch(fetchRequestDetails(id));
    }
  };

  const handleRejectQuotation = async (quotationId) => {
    const reason = window.prompt('Please provide a reason for rejection (optional):');
    await dispatch(rejectQuotation({ quotationId, reason: reason || '' }));
    dispatch(fetchRequestDetails(id));
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      await dispatch(cancelRequest(id));
      dispatch(fetchRequestDetails(id));
    }
  };

  if (isLoading && !currentRequest) {
    return <div className="text-center py-12 text-gray-500">Loading request details...</div>;
  }

  if (!currentRequest) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Request not found</p>
        <button
          onClick={() => navigate('/customer/requests')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Requests
        </button>
      </div>
    );
  }

  const canCancel = currentRequest.status !== 'Cancelled' &&
    currentRequest.status !== 'Completed' &&
    currentRequest.status !== 'Customer Rejected Quote' &&
    currentRequest.status !== 'Delivered';

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Request Details</h1>
            <p className="text-sm text-gray-500">ID: {currentRequest.id?.slice(0, 8)}...</p>
          </div>
          {canCancel && (
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
            >
              Cancel Request
            </button>
          )}
        </div>
      </div>

      {currentRequest.deliveryAssignment &&
        !['delivered', 'failed', 'returned'].includes(currentRequest.deliveryAssignment.status) && (
        <div className="bg-indigo-600 text-white rounded-lg p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="font-semibold">Your order is on the way! 🛵</p>
            <p className="text-sm text-indigo-100">Track your delivery partner live on the map.</p>
          </div>
          <button
            onClick={() => navigate(`/customer/track/${currentRequest.deliveryAssignment.id}`)}
            className="bg-white text-indigo-700 font-medium px-4 py-2 rounded-md hover:bg-indigo-50 whitespace-nowrap"
          >
            Track Delivery
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column - Request Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Request Details */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Request Information</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Description</span>
                <p className="text-gray-800 mt-0.5">{currentRequest.request_text}</p>
              </div>

              {currentRequest.shop && (
                <div>
                  <span className="text-sm text-gray-500">Shop</span>
                  <p className="text-gray-800 mt-0.5">{currentRequest.shop.name}</p>
                  <p className="text-xs text-gray-500">{currentRequest.shop.address}</p>
                </div>
              )}

              {currentRequest.delivery_address && (
                <div>
                  <span className="text-sm text-gray-500">Delivery Address</span>
                  <p className="text-gray-800 mt-0.5">{currentRequest.delivery_address}</p>
                </div>
              )}

              <div className="flex gap-4">
                <div>
                  <span className="text-sm text-gray-500">Urgency</span>
                  <p className="text-gray-800 mt-0.5 capitalize">{currentRequest.urgency}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Created</span>
                  <p className="text-gray-800 mt-0.5">
                    {new Date(currentRequest.created_at || currentRequest.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Images */}
            {currentRequest.images && currentRequest.images.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">Attached Images</span>
                <div className="flex gap-2 mt-2">
                  {currentRequest.images.map((img) => (
                    <img
                      key={img.id}
                      src={img.image_url}
                      alt={img.caption || 'Request image'}
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quotations */}
          {currentRequest.quotations && currentRequest.quotations.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800">Quotations</h2>
              {currentRequest.quotations.map((quotation) => (
                <QuotationCard
                  key={quotation.id}
                  quotation={quotation}
                  request={currentRequest}
                  onAccept={handleAcceptQuotation}
                  onReject={handleRejectQuotation}
                  isCustomer={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right column - Status Timeline */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4 sticky top-4">
            <StatusTimeline
              currentStatus={currentRequest.status}
              timeline={timeline}
            />
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-6">
        <button
          onClick={() => navigate('/customer/requests')}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back to Requests
        </button>
      </div>
    </div>
  );
};

export default RequestDetail;
