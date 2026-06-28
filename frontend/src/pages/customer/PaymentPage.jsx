import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeftIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import { fetchQuotation } from '../../store/slices/quotationSlice';
import { initiatePayment, fetchPaymentByQuotation, uploadScreenshot } from '../../store/slices/paymentSlice';
import UPIPayment from '../../components/payment/UPIPayment';
import CODPayment from '../../components/payment/CODPayment';
import PaymentStatus from '../../components/payment/PaymentStatus';

const PaymentPage = () => {
  const { quotationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentQuotation, isLoading: quotationLoading } = useSelector((state) => state.quotation);
  const { currentPayment, isLoading: paymentLoading, screenshotUploaded } = useSelector((state) => state.payment);

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [paymentStarted, setPaymentStarted] = useState(false);

  useEffect(() => {
    if (quotationId) {
      dispatch(fetchQuotation(quotationId));
      dispatch(fetchPaymentByQuotation(quotationId));
    }
  }, [dispatch, quotationId]);

  useEffect(() => {
    if (currentQuotation?.payment_method) {
      setPaymentMethod(currentQuotation.payment_method);
    }
  }, [currentQuotation]);

  const handleInitiatePayment = () => {
    dispatch(initiatePayment({
      quotation_id: quotationId,
      payment_method: paymentMethod,
    })).then((result) => {
      if (!result.error) {
        setPaymentStarted(true);
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

  if (quotationLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const quotation = currentQuotation;
  const amount = quotation?.final_amount || quotation?.total_amount || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <CreditCardIcon className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-semibold text-gray-800">Payment</h1>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Order Summary */}
        {quotation && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="font-semibold text-gray-800 mb-3">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Shop</span>
                <span className="font-medium">{quotation.shop?.name || 'Shop'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Items Total</span>
                <span>&#8377;{parseFloat(quotation.total_amount || 0).toFixed(2)}</span>
              </div>
              {quotation.delivery_charge > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Charge</span>
                  <span>&#8377;{parseFloat(quotation.delivery_charge).toFixed(2)}</span>
                </div>
              )}
              {quotation.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-&#8377;{parseFloat(quotation.discount).toFixed(2)}</span>
                </div>
              )}
              {quotation.tax_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>&#8377;{parseFloat(quotation.tax_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-blue-700">&#8377;{parseFloat(amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Existing Payment Info */}
        {currentPayment && !paymentStarted && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Payment Details</h2>
              <PaymentStatus status={currentPayment.status} />
            </div>

            {(currentPayment.payment_method === 'upi' || currentPayment.payment_method === 'manual_upi') && (
              <UPIPayment
                paymentData={currentPayment}
                onScreenshotUpload={handleScreenshotUpload}
                isUploading={paymentLoading}
              />
            )}

            {currentPayment.payment_method === 'cod' && (
              <CODPayment paymentData={currentPayment} />
            )}

            {screenshotUploaded && (
              <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-700">
                  Screenshot uploaded successfully. The shop owner will verify your payment.
                </p>
              </div>
            )}
          </div>
        )}

        {/* New Payment Initiation */}
        {!currentPayment && !paymentStarted && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="font-semibold text-gray-800 mb-4">Choose Payment Method</h2>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setPaymentMethod('upi')}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCardIcon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <span className="text-sm font-medium text-gray-800">UPI Payment</span>
                <p className="text-xs text-gray-500 mt-1">GPay, PhonePe, BHIM</p>
              </button>

              <button
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-3xl block mb-1">&#8377;</span>
                <span className="text-sm font-medium text-gray-800">Cash on Delivery</span>
                <p className="text-xs text-gray-500 mt-1">Pay at doorstep</p>
              </button>
            </div>

            <button
              onClick={handleInitiatePayment}
              disabled={paymentLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {paymentLoading ? 'Processing...' : `Pay &#8377;${parseFloat(amount).toFixed(2)}`}
            </button>
          </div>
        )}

        {/* Payment Started */}
        {paymentStarted && currentPayment && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Complete Payment</h2>
              <PaymentStatus status={currentPayment.status} />
            </div>

            {(currentPayment.payment_method === 'upi' || currentPayment.payment_method === 'manual_upi') && (
              <UPIPayment
                paymentData={currentPayment}
                onScreenshotUpload={handleScreenshotUpload}
                isUploading={paymentLoading}
              />
            )}

            {currentPayment.payment_method === 'cod' && (
              <CODPayment paymentData={currentPayment} />
            )}

            {screenshotUploaded && (
              <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-700">
                  Screenshot uploaded successfully. The shop owner will verify your payment.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
