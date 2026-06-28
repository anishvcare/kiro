import React from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const statusConfig = {
  initiated: {
    label: 'Initiated',
    color: 'text-gray-600 bg-gray-100',
    icon: ClockIcon,
  },
  pending: {
    label: 'Pending Verification',
    color: 'text-yellow-700 bg-yellow-100',
    icon: ClockIcon,
  },
  success: {
    label: 'Paid',
    color: 'text-green-700 bg-green-100',
    icon: CheckCircleIcon,
  },
  failed: {
    label: 'Failed',
    color: 'text-red-700 bg-red-100',
    icon: XCircleIcon,
  },
  refunded: {
    label: 'Refunded',
    color: 'text-purple-700 bg-purple-100',
    icon: ShieldCheckIcon,
  },
  verified: {
    label: 'Verified',
    color: 'text-blue-700 bg-blue-100',
    icon: ShieldCheckIcon,
  },
  settled: {
    label: 'Settled',
    color: 'text-green-800 bg-green-200',
    icon: CheckCircleIcon,
  },
};

const PaymentStatus = ({ status, size = 'md' }) => {
  const config = statusConfig[status] || {
    label: status || 'Unknown',
    color: 'text-gray-600 bg-gray-100',
    icon: ClockIcon,
  };

  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${config.color} ${sizeClasses}`}>
      <Icon className={iconSize} />
      {config.label}
    </span>
  );
};

export default PaymentStatus;
