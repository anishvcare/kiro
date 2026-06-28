import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  uploadDeliveryProofThunk,
  verifyOTPThunk,
  clearError,
  clearSuccess,
  clearOTPStatus,
  clearProofStatus,
} from '../../store/slices/deliverySlice';

const DeliveryProof = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get('id');

  const { isLoading, error, otpVerified, proofUploaded, successMessage } = useSelector(
    (state) => state.delivery
  );

  const [otp, setOtp] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [proofFile, setProofFile] = useState(null);

  useEffect(() => {
    return () => {
      dispatch(clearOTPStatus());
      dispatch(clearProofStatus());
    };
  }, [dispatch]);

  useEffect(() => {
    if (proofUploaded && otpVerified) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
        navigate('/delivery-boy');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [proofUploaded, otpVerified, dispatch, navigate]);

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return;
    dispatch(verifyOTPThunk({ assignmentId, otp }));
  };

  const handleUploadProof = (e) => {
    e.preventDefault();
    const url = proofUrl || (proofFile ? URL.createObjectURL(proofFile) : '');
    if (!url) return;
    dispatch(uploadDeliveryProofThunk({
      assignmentId,
      data: { proof_url: proofUrl || `/uploads/proofs/proof_${assignmentId}.jpg` },
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Delivery Verification</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {error}
          <button onClick={() => dispatch(clearError())} className="ml-2 underline text-xs">Dismiss</button>
        </div>
      )}

      {(proofUploaded && otpVerified) && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-sm">
          Delivery verified and proof uploaded successfully!
        </div>
      )}

      {/* OTP Verification */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">OTP Verification</h2>
        {otpVerified ? (
          <div className="flex items-center text-green-600">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">OTP Verified</span>
          </div>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-3">
            <p className="text-xs text-gray-500">
              Enter the 6-digit OTP provided by the customer to confirm delivery.
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-center text-lg tracking-widest font-mono focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-300"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}
      </div>

      {/* Proof Upload */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Delivery Proof Photo</h2>
        {proofUploaded ? (
          <div className="flex items-center text-green-600">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Proof Uploaded</span>
          </div>
        ) : (
          <form onSubmit={handleUploadProof} className="space-y-3">
            <p className="text-xs text-gray-500">
              Upload a photo as proof of delivery (e.g., package at doorstep).
            </p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="proof-upload"
              />
              <label htmlFor="proof-upload" className="cursor-pointer">
                {proofFile ? (
                  <p className="text-sm text-green-600">{proofFile.name}</p>
                ) : (
                  <>
                    <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-xs text-gray-500 mt-1">Tap to capture or select photo</p>
                  </>
                )}
              </label>
            </div>
            <div className="text-center text-xs text-gray-400">or</div>
            <input
              type="url"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder="Paste proof image URL"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading || (!proofFile && !proofUrl)}
              className="w-full px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 disabled:bg-gray-300"
            >
              {isLoading ? 'Uploading...' : 'Upload Proof'}
            </button>
          </form>
        )}
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

export default DeliveryProof;
