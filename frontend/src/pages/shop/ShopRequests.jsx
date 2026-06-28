import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchShopRequests } from '../../store/slices/requestSlice';

const ShopRequests = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { shopRequests, pagination, isLoading, error } = useSelector((state) => state.request);
  const { myShops } = useSelector((state) => state.shop);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedShop, setSelectedShop] = useState('');

  useEffect(() => {
    // Auto-select first shop if available
    if (myShops.length > 0 && !selectedShop) {
      setSelectedShop(myShops[0].id);
    }
  }, [myShops, selectedShop]);

  useEffect(() => {
    if (selectedShop) {
      dispatch(fetchShopRequests({
        shopId: selectedShop,
        params: { status: statusFilter || undefined },
      }));
    }
  }, [dispatch, selectedShop, statusFilter]);

  const getStatusColor = (status) => {
    const colors = {
      'Customer Request Sent': 'bg-blue-100 text-blue-800',
      'Shop Received Request': 'bg-purple-100 text-purple-800',
      'Shop Quotation Sent': 'bg-yellow-100 text-yellow-800',
      'Customer Accepted Quote': 'bg-green-100 text-green-800',
      'Customer Rejected Quote': 'bg-red-100 text-red-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Incoming Requests</h1>
        <div className="flex gap-2">
          {myShops.length > 1 && (
            <select
              value={selectedShop}
              onChange={(e) => setSelectedShop(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              {myShops.map((shop) => (
                <option key={shop.id} value={shop.id}>{shop.name}</option>
              ))}
            </select>
          )}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="Customer Request Sent">New Requests</option>
            <option value="Shop Received Request">Received</option>
            <option value="Shop Quotation Sent">Quoted</option>
            <option value="Customer Accepted Quote">Accepted</option>
            <option value="Customer Rejected Quote">Rejected</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {isLoading && shopRequests.length === 0 && (
        <div className="text-center py-12 text-gray-500">Loading requests...</div>
      )}

      {!isLoading && shopRequests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No incoming requests</p>
          <p className="text-sm text-gray-400 mt-1">Requests from customers will appear here</p>
        </div>
      )}

      <div className="space-y-4">
        {shopRequests.map((request) => (
          <div
            key={request.id}
            className="bg-white rounded-lg shadow border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/shop/request/${request.id}`)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {request.customer && (
                    <span className="text-sm font-semibold text-gray-900">{request.customer.name}</span>
                  )}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                  {request.urgency === 'urgent' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Urgent
                    </span>
                  )}
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
              <div className="flex gap-2">
                {request.status === 'Customer Request Sent' && (
                  <span className="text-xs text-blue-600 font-medium">Action Required</span>
                )}
                {request.quotations && request.quotations.length > 0 && (
                  <span className="text-xs text-green-600 font-medium">
                    Quoted: {parseFloat(request.quotations[0].final_amount).toFixed(2)}
                  </span>
                )}
              </div>
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
              onClick={() => dispatch(fetchShopRequests({
                shopId: selectedShop,
                params: { page: i + 1, status: statusFilter || undefined },
              }))}
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

export default ShopRequests;
