import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { submitCashCollectionThunk, clearError, clearSuccess } from '../../store/slices/deliverySlice';

const CashCollection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get('id');

  const { isLoading, error, successMessage } = useSelector((state) => state.delivery);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
        navigate('/delivery-boy');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    dispatch(submitCashCollectionThunk({
      assignment_id: assignmentId,
      amount: parseFloat(amount),
    }));
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Cash Collection</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {error}
          <button onClick={() => dispatch(clearError())} className="ml-2 underline text-xs">Dismiss</button>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-sm">
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center mb-6">
          <svg className="mx-auto h-12 w-12 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">Enter the cash amount collected from customer</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount Collected (Rs.)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-lg text-center font-semibold focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>

          <div className="text-xs text-gray-500">
            <p>Assignment ID: #{assignmentId?.slice(0, 8)}</p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
            className="w-full px-4 py-3 bg-orange-600 text-white font-medium rounded-md hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Submitting...' : 'Submit Cash Collection'}
          </button>
        </form>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
      >
        Go Back
      </button>
    </div>
  );
};

export default CashCollection;
