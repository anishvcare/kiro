import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { fetchTransactionHistory, verifyPayment } from '../../store/slices/paymentSlice';
import PaymentStatus from '../../components/payment/PaymentStatus';

const PaymentVerification = () => {
  const dispatch = useDispatch();
  const { transactions, pagination, isLoading, verificationSuccess } = useSelector((state) => state.payment);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [upiRefNumber, setUpiRefNumber] = useState('');
  const [verifyNotes, setVerifyNotes] = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  useEffect(() => {
    dispatch(fetchTransactionHistory({ status: 'pending' }));
  }, [dispatch]);

  useEffect(() => {
    if (verificationSuccess) {
      setShowVerifyModal(false);
      setSelectedTransaction(null);
      setUpiRefNumber('');
      setVerifyNotes('');
      dispatch(fetchTransactionHistory({ status: 'pending' }));
    }
  }, [verificationSuccess, dispatch]);

  const handleVerify = (transaction) => {
    setSelectedTransaction(transaction);
    setShowVerifyModal(true);
  };

  const handleApprove = () => {
    if (selectedTransaction) {
      dispatch(verifyPayment({
        transactionId: selectedTransaction.id,
        data: {
          approved: true,
          upi_ref_number: upiRefNumber || undefined,
          notes: verifyNotes || undefined,
        },
      }));
    }
  };

  const handleReject = () => {
    if (selectedTransaction) {
      dispatch(verifyPayment({
        transactionId: selectedTransaction.id,
        data: {
          approved: false,
          notes: verifyNotes || 'Payment rejected by shop owner',
        },
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-800">Payment Verification</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Review and verify customer payments
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading && transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto" />
            <p className="mt-4 text-gray-600 font-medium">All caught up!</p>
            <p className="text-sm text-gray-500">No pending payments to verify</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-800">
                      &#8377;{parseFloat(transaction.amount).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {transaction.payment_method === 'upi' || transaction.payment_method === 'manual_upi'
                        ? 'UPI Payment'
                        : transaction.payment_method === 'cod'
                        ? 'Cash on Delivery'
                        : transaction.payment_method}
                    </p>
                  </div>
                  <PaymentStatus status={transaction.status} />
                </div>

                <div className="text-xs text-gray-500 space-y-1 mb-3">
                  <p>Transaction: {transaction.id}</p>
                  <p>Date: {new Date(transaction.createdAt || transaction.created_at).toLocaleDateString()}</p>
                  {transaction.shop && <p>Shop: {transaction.shop.name}</p>}
                </div>

                {transaction.status === 'pending' && (
                  <button
                    onClick={() => handleVerify(transaction)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <EyeIcon className="w-4 h-4" />
                    Review & Verify
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: pagination.total_pages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => dispatch(fetchTransactionHistory({ page: i + 1, status: 'pending' }))}
                className={`px-3 py-1 rounded text-sm ${
                  pagination.page === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Verification Modal */}
      {showVerifyModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Verify Payment
            </h3>

            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">&#8377;{parseFloat(selectedTransaction.amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">Method:</span>
                <span>{selectedTransaction.payment_method}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="text-xs">{selectedTransaction.id}</span>
              </div>
            </div>

            {/* Screenshot Display */}
            {selectedTransaction.screenshots && selectedTransaction.screenshots.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Payment Screenshot</p>
                {selectedTransaction.screenshots.map((ss) => (
                  <img
                    key={ss.id}
                    src={ss.image_url}
                    alt="Payment screenshot"
                    className="w-full rounded border max-h-64 object-contain"
                  />
                ))}
              </div>
            )}

            {/* UPI Reference Number */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-1">
                UPI Reference Number (optional)
              </label>
              <input
                type="text"
                value={upiRefNumber}
                onChange={(e) => setUpiRefNumber(e.target.value)}
                placeholder="Enter 12-digit UPI reference"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Notes (optional)
              </label>
              <textarea
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                placeholder="Add any notes..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none resize-none"
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-700 border border-red-200 py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
              >
                <XCircleIcon className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={handleApprove}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <CheckCircleIcon className="w-4 h-4" />
                Approve
              </button>
            </div>

            <button
              onClick={() => setShowVerifyModal(false)}
              className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentVerification;
