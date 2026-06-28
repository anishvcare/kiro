import React from 'react';
import {
  BanknotesIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import PaymentStatus from './PaymentStatus';

const codSteps = [
  {
    id: 'order_placed',
    label: 'Order Placed',
    description: 'Your order has been confirmed with COD',
    icon: CheckCircleIcon,
  },
  {
    id: 'out_for_delivery',
    label: 'Out for Delivery',
    description: 'Delivery boy is on the way',
    icon: TruckIcon,
  },
  {
    id: 'cash_collected',
    label: 'Cash Collected',
    description: 'Delivery boy collected payment',
    icon: BanknotesIcon,
  },
  {
    id: 'settled',
    label: 'Settled',
    description: 'Payment verified and settled to shop',
    icon: CheckCircleIcon,
  },
];

const CODPayment = ({ paymentData }) => {
  const { amount, status, transaction_id } = paymentData || {};

  // Determine current step based on status
  const getCurrentStep = () => {
    switch (status) {
      case 'initiated':
      case 'pending':
        return 0;
      case 'out_for_delivery':
        return 1;
      case 'success':
        return 2;
      case 'settled':
        return 3;
      default:
        return 0;
    }
  };

  const currentStep = getCurrentStep();

  return (
    <div className="space-y-4">
      {/* COD Header */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <BanknotesIcon className="w-8 h-8 text-amber-600" />
          <div>
            <h4 className="font-medium text-amber-900">Cash on Delivery</h4>
            <p className="text-sm text-amber-700">
              Pay &#8377;{parseFloat(amount || 0).toFixed(2)} when your order is delivered
            </p>
          </div>
        </div>
      </div>

      {/* Status */}
      {status && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Payment Status:</span>
          <PaymentStatus status={status} />
        </div>
      )}

      {/* COD Progress Steps */}
      <div className="space-y-3">
        {codSteps.map((step, index) => {
          const isCompleted = index <= currentStep;
          const isCurrent = index === currentStep;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {isCompleted ? (
                  <Icon className="w-4 h-4" />
                ) : (
                  <ClockIcon className="w-4 h-4" />
                )}
              </div>
              <div className={`flex-1 ${index < codSteps.length - 1 ? 'pb-3 border-l-2 ml-4 pl-7 -mt-1' : ''} ${
                isCompleted ? 'border-green-200' : 'border-gray-200'
              }`}>
                <p className={`text-sm font-medium ${
                  isCurrent ? 'text-green-700' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                }`}>
                  {step.label}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Information Note */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
        <p className="text-xs text-blue-700">
          Please keep the exact amount ready. The delivery partner will collect cash at the time of delivery.
        </p>
      </div>

      {/* Transaction ID */}
      {transaction_id && (
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Transaction ID: {transaction_id}
          </p>
        </div>
      )}
    </div>
  );
};

export default CODPayment;
