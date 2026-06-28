import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchQuotationsByRequest } from '../../store/slices/quotationSlice';
import { fetchShopRequests } from '../../store/slices/requestSlice';

const QuotationHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { shopRequests } = useSelector((state) => state.request);
  const { myShops } = useSelector((state) => state.shop);

  useEffect(() => {
    if (myShops.length > 0) {
      dispatch(fetchShopRequests({
        shopId: myShops[0].id,
        params: {},
      }));
    }
  }, [dispatch, myShops]);

  // Filter requests that have quotations
  const requestsWithQuotations = shopRequests.filter(
    (r) => r.quotations && r.quotations.length > 0
  );

  const getStatusBadge = (status) => {
    const colors = {
      sent: 'bg-yellow-100 text-yellow-800',
      viewed: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quotation History</h1>

      {requestsWithQuotations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No quotations sent yet</p>
        </div>
      )}

      <div className="space-y-4">
        {requestsWithQuotations.map((request) => (
          <div key={request.id} className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 line-clamp-1">
                  {request.request_text}
                </p>
                <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                  {new Date(request.created_at || request.createdAt).toLocaleDateString()}
                </span>
              </div>
              {request.customer && (
                <p className="text-xs text-gray-500 mt-0.5">Customer: {request.customer.name}</p>
              )}
            </div>

            <div className="border-t border-gray-100 pt-3">
              {request.quotations.map((q) => (
                <div
                  key={q.id}
                  className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 rounded px-2"
                  onClick={() => navigate(`/shop/request/${request.id}`)}
                >
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Total: {parseFloat(q.final_amount).toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      {new Date(q.created_at || q.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(q.status)}`}>
                    {q.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuotationHistory;
