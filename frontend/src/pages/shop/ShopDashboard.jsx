import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchMyShops, fetchShopDashboard } from '../../store/slices/shopSlice';
import { getShopRatings } from '../../services/ratingService';

// Small read-only star row for a given score (1-5).
const Stars = ({ score = 0 }) => (
  <span className="inline-flex">
    {[1, 2, 3, 4, 5].map((n) => (
      <svg key={n} className={`w-4 h-4 ${n <= score ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </span>
);

const StatCard = ({ title, value, icon, color, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-lg shadow p-5 ${onClick ? 'cursor-pointer hover:shadow-md hover:ring-2 hover:ring-green-400 transition' : ''}`}
  >
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        <svg className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const ShopDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myShops, dashboard, isLoading } = useSelector((state) => state.shop);
  const [feedback, setFeedback] = useState(null); // { rating, total_ratings, reviews }

  useEffect(() => {
    dispatch(fetchMyShops());
  }, [dispatch]);

  useEffect(() => {
    if (myShops.length > 0) {
      dispatch(fetchShopDashboard(myShops[0].id));
      // Load customer feedback/reviews for this shop.
      getShopRatings(myShops[0].id)
        .then((data) => setFeedback(data))
        .catch(() => setFeedback(null));
    }
  }, [dispatch, myShops]);

  const currentShop = myShops[0];
  const stats = dashboard?.stats;

  if (isLoading && !currentShop) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-24" />
        ))}
      </div>
    );
  }

  if (!currentShop) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No shop registered</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by registering your shop.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{currentShop.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              currentShop.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {currentShop.is_verified ? 'Verified' : 'Pending Verification'}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              currentShop.is_active ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
            }`}>
              {currentShop.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Requests"
          value={stats?.totalRequests || 0}
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          color="bg-blue-500"
          onClick={() => navigate('/shop/requests')}
        />
        <StatCard
          title="Active Requests"
          value={stats?.activeRequests || 0}
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          color="bg-green-500"
          onClick={() => navigate('/shop/requests')}
        />
        <StatCard
          title="Total Quotations"
          value={stats?.totalQuotations || 0}
          icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          color="bg-purple-500"
          onClick={() => navigate('/shop/quotation-history')}
        />
        <StatCard
          title="Rating"
          value={`${(stats?.rating || 0).toFixed(1)} / 5`}
          icon="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          color="bg-yellow-500"
        />
      </div>

      {/* Shop Details Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Shop Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Category</p>
            <p className="text-sm font-medium">{currentShop.category?.name || 'Not set'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Address</p>
            <p className="text-sm font-medium">{currentShop.address || 'Not set'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Phone</p>
            <p className="text-sm font-medium">{currentShop.phone || 'Not set'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Hours</p>
            <p className="text-sm font-medium">
              {currentShop.opening_time && currentShop.closing_time
                ? `${currentShop.opening_time} - ${currentShop.closing_time}`
                : 'Not set'}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Feedback */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Customer Feedback</h2>
          {feedback && feedback.total_ratings > 0 && (
            <div className="flex items-center gap-2">
              <Stars score={Math.round(feedback.rating)} />
              <span className="text-sm font-medium text-gray-700">
                {parseFloat(feedback.rating || 0).toFixed(1)} ({feedback.total_ratings})
              </span>
            </div>
          )}
        </div>

        {feedback && feedback.reviews && feedback.reviews.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {feedback.reviews.map((r) => (
              <div key={r.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-sm font-semibold">
                      {(r.reviewer || 'C').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{r.reviewer || 'Customer'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Stars score={r.score} />
                    <span className="text-[11px] text-gray-400">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                </div>
                {r.comment && (
                  <p className="text-sm text-gray-700 mt-1.5 whitespace-pre-wrap">{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400">
            <svg className="w-10 h-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <p className="text-sm">No customer feedback yet. Reviews appear here after customers rate a delivered order.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopDashboard;
