import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRequestDetails, cancelRequest } from '../../store/slices/requestSlice';
import { acceptQuotation, rejectQuotation } from '../../store/slices/quotationSlice';
import StatusTimeline from '../../components/request/StatusTimeline';
import QuotationCard from '../../components/quotation/QuotationCard';
import { submitShopRating, getMyRatingForRequest } from '../../services/ratingService';

const RATEABLE_STATUSES = ['Delivered', 'Payment Verified', 'Payment Settled To Shop', 'Completed'];

const RequestDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentRequest, timeline, isLoading, error } = useSelector((state) => state.request);
  const { isLoading: quotationLoading } = useSelector((state) => state.quotation);

  // Shop rating + review state
  const [myRating, setMyRating] = useState(null); // { score, comment } once submitted
  const [score, setScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(0);
  const [comment, setComment] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState('');

  const canRate = currentRequest && RATEABLE_STATUSES.includes(currentRequest.status);
  const shopId = currentRequest?.shop_id || currentRequest?.shop?.id;

  // Load any existing rating for this order once it's rateable.
  useEffect(() => {
    if (!id || !canRate) return;
    let active = true;
    getMyRatingForRequest(id)
      .then((data) => {
        if (active && data && data.rating) {
          setMyRating(data.rating);
          setScore(data.rating.score || 0);
          setComment(data.rating.comment || '');
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, [id, canRate]);

  const handleSubmitRating = async () => {
    if (!score) {
      setRatingError('Please select a star rating.');
      return;
    }
    setRatingError('');
    setRatingSubmitting(true);
    try {
      const data = await submitShopRating({ requestId: id, score, comment });
      setMyRating(data.rating || { score, comment });
    } catch (err) {
      setRatingError(err.response?.data?.message || 'Failed to submit your rating.');
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleMessageShop = () => {
    if (shopId) navigate(`/customer/chat?shopId=${shopId}&requestId=${id}`);
  };

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

          {/* Rate the shop + message (after delivery) */}
          {canRate && (
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  {myRating ? 'Your Rating' : 'Rate this shop'}
                </h2>
                {shopId && (
                  <button
                    onClick={handleMessageShop}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-3 py-1.5 hover:bg-blue-100"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Message Shop
                  </button>
                )}
              </div>

              {/* Stars */}
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => !myRating && setScore(n)}
                    onMouseEnter={() => !myRating && setHoverScore(n)}
                    onMouseLeave={() => !myRating && setHoverScore(0)}
                    disabled={!!myRating}
                    className={myRating ? 'cursor-default' : 'cursor-pointer'}
                    aria-label={`${n} star`}
                  >
                    <svg
                      className={`w-8 h-8 ${(hoverScore || score) >= n ? 'text-yellow-400' : 'text-gray-300'}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>

              {myRating ? (
                <div>
                  {myRating.comment && (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{myRating.comment}</p>
                  )}
                  <p className="text-xs text-green-600 mt-2">Thanks for your feedback!</p>
                </div>
              ) : (
                <>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="Share your experience with this shop (optional)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {ratingError && <p className="text-xs text-red-600 mt-1">{ratingError}</p>}
                  <button
                    onClick={handleSubmitRating}
                    disabled={ratingSubmitting}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right column - Status Timeline */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4 sticky top-4">
            <StatusTimeline
              currentStatus={currentRequest.status}
              timeline={timeline}
              endAtDelivered
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
