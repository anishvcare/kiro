import React from 'react';

const QuotationCard = ({ quotation, request, onAccept, onReject, onChat, isCustomer = true }) => {
  const {
    id,
    total_amount,
    delivery_charge,
    discount,
    tax_amount,
    final_amount,
    notes,
    status,
    items,
    payment_method,
    estimated_prep_time,
    created_at,
    shop,
  } = quotation;

  const getStatusBadge = () => {
    const statusColors = {
      sent: 'bg-yellow-100 text-yellow-800',
      viewed: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h4 className="text-sm font-semibold text-gray-700">Quotation #{id?.slice(0, 8)}</h4>
          {shop && <p className="text-xs text-gray-500 mt-0.5">{shop.name}</p>}
        </div>
        {getStatusBadge()}
      </div>

      {/* Request Info */}
      {request && (
        <div className="px-4 py-3 border-b border-gray-100 bg-blue-50">
          <p className="text-xs text-gray-500">Request</p>
          <p className="text-sm text-gray-700 mt-0.5 line-clamp-2">{request.request_text}</p>
          {request.images && request.images.length > 0 && (
            <div className="flex gap-1 mt-2">
              {request.images.map((img) => (
                <img
                  key={img.id}
                  src={img.image_url}
                  alt="Request"
                  className="w-10 h-10 object-cover rounded"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Items */}
      {items && items.length > 0 && (
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Items</p>
          <div className="space-y-1">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.item_name} {item.quantity > 1 ? `x${item.quantity}` : ''} {item.unit ? `(${item.unit})` : ''}
                </span>
                <span className="text-gray-900 font-medium">
                  {parseFloat(item.total_price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span>{parseFloat(total_amount).toFixed(2)}</span>
          </div>
          {parseFloat(delivery_charge) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Charge</span>
              <span>{parseFloat(delivery_charge).toFixed(2)}</span>
            </div>
          )}
          {parseFloat(discount) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Discount</span>
              <span className="text-green-600">-{parseFloat(discount).toFixed(2)}</span>
            </div>
          )}
          {parseFloat(tax_amount) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span>{parseFloat(tax_amount).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
            <span>Total</span>
            <span className="text-blue-600">{parseFloat(final_amount).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="px-4 py-3 border-b border-gray-100 space-y-2">
        {payment_method && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Payment Method</span>
            <span className="text-gray-700">{payment_method}</span>
          </div>
        )}
        {estimated_prep_time && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Estimated Prep Time</span>
            <span className="text-gray-700">{estimated_prep_time}</span>
          </div>
        )}
        {notes && (
          <div className="text-sm">
            <span className="text-gray-500">Notes: </span>
            <span className="text-gray-700">{notes}</span>
          </div>
        )}
        {created_at && (
          <div className="text-xs text-gray-400">
            Sent: {new Date(created_at).toLocaleString()}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {isCustomer && (status === 'sent' || status === 'viewed') && (
        <div className="px-4 py-3 bg-gray-50 flex gap-2">
          <button
            onClick={() => onAccept && onAccept(id)}
            className="flex-1 py-2 px-3 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500"
          >
            Accept
          </button>
          <button
            onClick={() => onReject && onReject(id)}
            className="flex-1 py-2 px-3 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500"
          >
            Reject
          </button>
          {onChat && (
            <button
              onClick={() => onChat(id)}
              className="py-2 px-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
              Chat
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default QuotationCard;
