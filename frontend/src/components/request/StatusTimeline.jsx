import React from 'react';

const REQUEST_STATUSES = [
  'Customer Request Sent',
  'Shop Received Request',
  'Shop Quotation Sent',
  'Customer Accepted Quote',
  'Customer Rejected Quote',
  'Delivery Agent Notified',
  'Delivery Boy Assigned',
  'Delivery Boy Accepted',
  'Reached Shop',
  'Picked Up From Shop',
  'Out For Delivery',
  'Reached Customer',
  'Delivered',
  'Cash Collected',
  'Payment Verified',
  'Payment Settled To Shop',
  'Completed',
  'Cancelled',
];

// Back-office steps shown after delivery (hidden when endAtDelivered is set).
const POST_DELIVERY_STATUSES = [
  'Cash Collected',
  'Payment Verified',
  'Payment Settled To Shop',
  'Completed',
];

const StatusTimeline = ({ currentStatus, timeline, endAtDelivered = false }) => {
  const isCancelled = currentStatus === 'Cancelled';
  const isRejected = currentStatus === 'Customer Rejected Quote';

  // Build display statuses (normal flow excludes rejected and cancelled unless that's the current state)
  const getDisplayStatuses = () => {
    if (timeline && timeline.length > 0) {
      return timeline;
    }

    // Build timeline from statuses
    const currentIndex = REQUEST_STATUSES.indexOf(currentStatus);

    if (isCancelled || isRejected) {
      // Show progress up to cancelled/rejected
      return REQUEST_STATUSES.map((status) => ({
        status,
        completed: status === currentStatus,
        active: status === currentStatus,
        cancelled: isCancelled && status === 'Cancelled',
        rejected: isRejected && status === 'Customer Rejected Quote',
      }));
    }

    // Normal flow - exclude Cancelled and Customer Rejected Quote
    return REQUEST_STATUSES
      .filter((s) => s !== 'Cancelled' && s !== 'Customer Rejected Quote')
      .map((status) => {
        const statusIndex = REQUEST_STATUSES.indexOf(status);
        return {
          status,
          completed: statusIndex <= currentIndex,
          active: status === currentStatus,
        };
      });
  };

  // When endAtDelivered is set (customer view), hide the back-office steps so the
  // visible timeline ends at "Delivered".
  const displayStatuses = getDisplayStatuses().filter(
    (item) => !endAtDelivered || !POST_DELIVERY_STATUSES.includes(item.status)
  );

  const getStatusColor = (item) => {
    if (item.cancelled) return 'bg-red-500 border-red-500';
    if (item.rejected) return 'bg-orange-500 border-orange-500';
    if (item.active) return 'bg-blue-500 border-blue-500';
    if (item.completed) return 'bg-green-500 border-green-500';
    return 'bg-gray-200 border-gray-300';
  };

  const getLineColor = (item) => {
    if (item.completed || item.active) return 'bg-green-500';
    return 'bg-gray-200';
  };

  const getTextColor = (item) => {
    if (item.cancelled) return 'text-red-600 font-semibold';
    if (item.rejected) return 'text-orange-600 font-semibold';
    if (item.active) return 'text-blue-600 font-semibold';
    if (item.completed) return 'text-green-600';
    return 'text-gray-400';
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Timeline</h3>
      <div className="relative">
        {displayStatuses.map((item, index) => (
          <div key={item.status} className="flex items-start mb-1">
            {/* Dot and line */}
            <div className="flex flex-col items-center mr-3">
              <div
                className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${getStatusColor(item)}`}
              />
              {index < displayStatuses.length - 1 && (
                <div className={`w-0.5 h-6 ${getLineColor(item)}`} />
              )}
            </div>
            {/* Status text */}
            <div className={`text-sm pb-1 ${getTextColor(item)}`}>
              {item.status}
              {item.active && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Current
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusTimeline;
