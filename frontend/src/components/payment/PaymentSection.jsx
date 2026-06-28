import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  CreditCardIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { initiatePayment, fetchPaymentByQuotation, uploadScreenshot } from '../../store/slices/paymentSlice';
import UPIPayment from './UPIPayment';
import CODPayment from './CODPayment';
import PaymentStatus from './PaymentStatus';

const PaymentSection = ({ quotation }) => {
  const dispatch = useDispatch();
  const { currentPayment, isLoading, screenshotUploaded } = useSelector((state) => state.payment);
  const [paymentMethod, setPaymentMethod] = useState(quotation?.payment_method || 'upi');
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  useEffect(() => {
    if (quotation?.id) {
      dispatch(fetchPaymentByQuotation(quotation.id));
    }
  }, [dispatch, quotation?.id]);

  const handleInitiatePayment = () => {
    dispatch(initiatePayment({
      quotation_id: quotation.id,
      payment_method: paymentMethod,
    })).then((result) => {
      if (!result.error) {
        setPaymentInitiated(true);
      }
    });
  };

  const handleScreenshotUpload = (file) => {
    if (currentPayment?.transaction_id) {
      dispatch(uploadScreenshot({
        transactionId: currentPayment.transaction_id,
        file,
      }));
    }
  };

  // If quotation is not accepted, don't show payment
  if (!quotation || quotation.status !== 'accepted') {
    return null;
  }

  const amount = quotation.final_amount || quotation.total_amount;

  return (
    <div className="border-t mt-4 pt-4">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
        <CreditCardIcon className="w-5 h-5" />
        Payment
      </h3>

      {/* Payment Summary */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Amount</span>
          <span className="text-xl font-bold text-gray-800">
            &#8377;{parseFloat(amount).toFixed(2)}
          </span>
        </div>
        {currentPayment?.status && (
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600">Status</span>
            <PaymentStatus status={currentPayment.status} />
          </div>
        )}
        {currentPayment?.transaction_id && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Transaction: {currentPayment.transaction_id}
            </p>
          </div>
        )}
      </div>

      {/* If payment already exists, show status */}
      {currentPayment && currentPayment.status !== 'initiated' && currentPayment.payment_method !== 'cod' && (
        <div className="mb-4">
          <UPIPayment
            paymentData={currentPayment}
            onScreenshotUpload={handleScreenshotUpload}
            isUploading={isLoading}
          />
          {screenshotUploaded && (
            <div className="mt-2 bg-green-50 border border-green-200 rounded p-2">
              <p className="text-sm text-green-700">Screenshot uploaded. Awaiting verification.</p>
            </div>
          )}
        </div>
      )}

      {currentPayment && currentPayment.payment_method === 'cod' && (
        <CODPayment paymentData={currentPayment} />
      )}

      {/* Payment initiation (if no payment exists yet) */}
      {!currentPayment && !paymentInitiated && (
        <div className="space-y-3">
          {/* Payment Method Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Choose Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  paymentMethod === 'upi'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCardIcon className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs font-medium">UPI</span>
              </button>
              <button
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  paymentMethod === 'cod'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <BanknotesIcon className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs font-medium">Cash on Delivery</span>
              </button>
            </div>
          </div>

          {/* Pay Button */}
          <button
            onClick={handleInitiatePayment}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Processing...' : paymentMethod === 'cod' ? 'Confirm COD' : 'Proceed to Pay'}
          </button>
        </div>
      )}

      {/* Just initiated payment - show UPI details */}
      {paymentInitiated && currentPayment && currentPayment.payment_method !== 'cod' && (
        <UPIPayment
          paymentData={currentPayment}
          onScreenshotUpload={handleScreenshotUpload}
          isUploading={isLoading}
        />
      )}

      {paymentInitiated && currentPayment && currentPayment.payment_method === 'cod' && (
        <CODPayment paymentData={currentPayment} />
      )}
    </div>
  );
};

export default PaymentSection;
