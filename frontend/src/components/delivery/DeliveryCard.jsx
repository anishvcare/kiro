const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  picked_up: 'bg-purple-100 text-purple-800',
  in_transit: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  returned: 'bg-gray-100 text-gray-800',
};

const DeliveryCard = ({ delivery, onAction, actionLabel, showDetails = true }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            #{delivery.id?.slice(0, 8)}
          </h3>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${statusColors[delivery.status] || 'bg-gray-100 text-gray-800'}`}>
            {delivery.status?.replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>
        {delivery.payment_type && (
          <span className={`text-xs font-medium px-2 py-1 rounded ${
            delivery.payment_type === 'COD' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
          }`}>
            {delivery.payment_type}
          </span>
        )}
      </div>

      {showDetails && (
        <div className="space-y-2 text-sm text-gray-600">
          {delivery.pickup_address && (
            <div className="flex items-start">
              <svg className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <div>
                <p className="text-xs text-gray-400">Pickup</p>
                <p>{delivery.pickup_address}</p>
              </div>
            </div>
          )}
          {delivery.delivery_address && (
            <div className="flex items-start">
              <svg className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <div>
                <p className="text-xs text-gray-400">Delivery</p>
                <p>{delivery.delivery_address}</p>
              </div>
            </div>
          )}
          {delivery.amount && (
            <div className="flex items-center">
              <svg className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-gray-900">Rs. {delivery.amount}</span>
            </div>
          )}
        </div>
      )}

      {delivery.deliveryBoy && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">Delivery Boy</p>
          <p className="text-sm font-medium text-gray-900">
            {delivery.deliveryBoy.user?.first_name} {delivery.deliveryBoy.user?.last_name}
          </p>
          {delivery.deliveryBoy.user?.phone && (
            <p className="text-xs text-gray-500">{delivery.deliveryBoy.user.phone}</p>
          )}
        </div>
      )}

      {onAction && actionLabel && (
        <div className="mt-4">
          <button
            onClick={() => onAction(delivery)}
            className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default DeliveryCard;
