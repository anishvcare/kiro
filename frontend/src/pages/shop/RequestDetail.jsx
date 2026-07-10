import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRequestDetails, updateRequestStatus } from '../../store/slices/requestSlice';
import StatusTimeline from '../../components/request/StatusTimeline';
import QuotationCard from '../../components/quotation/QuotationCard';
import { mediaUrl } from '../../utils/media';

const ShopRequestDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentRequest, timeline, isLoading, error } = useSelector((state) => state.request);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchRequestDetails(id));
    // Poll so the Status Timeline advances live as the delivery boy progresses.
    const timer = setInterval(() => {
      dispatch(fetchRequestDetails(id));
    }, 10000);
    return () => clearInterval(timer);
  }, [dispatch, id]);

  const handleMarkReceived = async () => {
    await dispatch(updateRequestStatus({ requestId: id, status: 'Shop Received Request' }));
  };

  const handleConfirmPayment = async () => {
    if (window.confirm('Confirm you have received the payment from the delivery agent? This completes the order.')) {
      await dispatch(updateRequestStatus({ requestId: id, status: 'Completed' }));
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
          onClick={() => navigate('/shop/requests')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Requests
        </button>
      </div>
    );
  }

  const canCreateQuotation =
    currentRequest.status === 'Shop Received Request' ||
    currentRequest.status === 'Customer Request Sent';

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
            <h1 className="text-xl font-bold text-gray-900 mb-1">Request from Customer</h1>
            <p className="text-sm text-gray-500">ID: {currentRequest.id?.slice(0, 8)}...</p>
          </div>
          <div className="flex gap-2">
            {currentRequest.status === 'Customer Request Sent' && (
              <button
                onClick={handleMarkReceived}
                className="px-3 py-1 text-sm text-purple-600 border border-purple-300 rounded hover:bg-purple-50"
              >
                Mark as Received
              </button>
            )}
            {canCreateQuotation && (
              <button
                onClick={() => navigate(`/shop/create-quotation/${currentRequest.id}`)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Send Quotation
              </button>
            )}
            {currentRequest.status === 'Payment Settled To Shop' && (
              <button
                onClick={handleConfirmPayment}
                className="px-3 py-1.5 text-sm bg-green-600 text-white font-medium rounded hover:bg-green-700"
              >
                Confirm Payment &amp; Complete
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column - Request Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Customer & Request Details */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Customer Details</h2>
            <div className="space-y-3">
              {currentRequest.customer && (
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {currentRequest.customer.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{currentRequest.customer.name}</p>
                    <p className="text-xs text-gray-500">{currentRequest.customer.phone || currentRequest.customer.email}</p>
                  </div>
                </div>
              )}

              <div>
                <span className="text-sm text-gray-500">Request Description</span>
                <p className="text-gray-800 mt-0.5 whitespace-pre-wrap">{currentRequest.request_text}</p>
              </div>

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
                  <span className="text-sm text-gray-500">Received</span>
                  <p className="text-gray-800 mt-0.5">
                    {new Date(currentRequest.created_at || currentRequest.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Images */}
            {currentRequest.images && currentRequest.images.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">Customer Uploaded Images</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentRequest.images.map((img, idx) => (
                    <a
                      key={img.id}
                      href={mediaUrl(img.image_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-3 py-2 hover:bg-blue-100"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {currentRequest.images.length > 1 ? `View Image ${idx + 1}` : 'View Image'}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Existing Quotations */}
          {currentRequest.quotations && currentRequest.quotations.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800">Quotations Sent</h2>
              {currentRequest.quotations.map((quotation) => (
                <QuotationCard
                  key={quotation.id}
                  quotation={quotation}
                  request={currentRequest}
                  isCustomer={false}
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
          onClick={() => navigate('/shop/requests')}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back to Requests
        </button>
      </div>
    </div>
  );
};

export default ShopRequestDetail;
