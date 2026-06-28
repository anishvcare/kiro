import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchMyRequests } from '../../store/slices/requestSlice';
import StatusTimeline from '../../components/request/StatusTimeline';

const MyRequests = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { requests, pagination, isLoading, error } = useSelector((state) => state.request);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    dispatch(fetchMyRequests({ status: statusFilter || undefined }));
  }, [dispatch, statusFilter]);

  const getStatusColor = (status) => {
    const colors = {
      'Customer Request Sent': 'bg-blue-100 text-blue-800',
      'Shop Received Request': 'bg-purple-100 text-purple-800',
      'Shop Quotation Sent': 'bg-yellow-100 text-yellow-800',
      'Customer Accepted Quote': 'bg-green-100 text-green-800',
      'Customer Rejected Quote': 'bg-red-100 text-red-800',
      'Delivery Agent Notified': 'bg-indigo-100 text-indigo-800',
      'Delivery Boy Assigned': 'bg-indigo-100 text-indigo-800',
      'Delivery Boy Accepted': 'bg-indigo-100 text-indigo-800',
      'Reached Shop': 'bg-teal-100 text-teal-800',
      'Picked Up From Shop': 'bg-teal-100 text-teal-800',
      'Out For Delivery': 'bg-orange-100 text-orange-800',
      'Reached Customer': 'bg-orange-100 text-orange-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cash Collected': 'bg-emerald-100 text-emerald-800',
      'Payment Verified': 'bg-emerald-100 text-emerald-800',
      'Payment Settled To Shop': 'bg-emerald-100 text-emerald-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="Customer Request Sent">Sent</option>
          <option value="Shop Quotation Sent">Quotation Received</option>
          <option value="Customer Accepted Quote">Accepted</option>
          <option value="Out For Delivery">In Delivery</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {isLoading && requests.length === 0 && (
        <div className="text-center py-12 text-gray-500">Loading requests...</div>
      )}

      {!isLoading && requests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No requests found</p>
          <button
            onClick={() => navigate('/customer/search')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Search Shops
          </button>
        </div>
      )}

      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="bg-white rounded-lg shadow border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/customer/request/${request.id}`)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {request.shop && (
                    <span className="text-sm font-semibold text-gray-900">{request.shop.name}</span>
                  )}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{request.request_text}</p>
              </div>
              {request.images && request.images.length > 0 && (
                <img
                  src={request.images[0].image_url}
                  alt="Request"
                  className="w-12 h-12 object-cover rounded ml-3"
                />
              )}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                {new Date(request.created_at || request.createdAt).toLocaleDateString()}
              </span>
              {request.quotations && request.quotations.length > 0 && (
                <span className="text-xs text-blue-600 font-medium">
                  {request.quotations.length} quotation(s)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => dispatch(fetchMyRequests({ page: i + 1, status: statusFilter || undefined }))}
              className={`px-3 py-1 rounded text-sm ${
                pagination.page === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequests;
