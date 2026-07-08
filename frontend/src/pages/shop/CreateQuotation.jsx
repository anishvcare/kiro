import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { createQuotation, clearCreateSuccess } from '../../store/slices/quotationSlice';
import { fetchRequestDetails } from '../../store/slices/requestSlice';
import api from '../../services/api';
import { mediaUrl } from '../../utils/media';

const CreateQuotation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { requestId } = useParams();
  const { currentRequest } = useSelector((state) => state.request);
  const { isLoading, error, createSuccess } = useSelector((state) => state.quotation);
  const { myShops } = useSelector((state) => state.shop);

  const [billFile, setBillFile] = useState(null);
  const [billPreview, setBillPreview] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [approxWeight, setApproxWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [validUntil, setValidUntil] = useState('');

  const [estimate, setEstimate] = useState(null); // { delivery_charge, distance_km }
  const [estimating, setEstimating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState('');

  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const estimateTimer = useRef(null);

  const shopId = currentRequest?.shop_id || (myShops && myShops.length > 0 ? myShops[0].id : null);

  useEffect(() => {
    if (requestId) {
      dispatch(fetchRequestDetails(requestId));
    }
  }, [dispatch, requestId]);

  useEffect(() => {
    if (createSuccess) {
      dispatch(clearCreateSuccess());
      navigate(`/shop/request/${requestId}`);
    }
  }, [createSuccess, dispatch, navigate, requestId]);

  // Live delivery-charge estimate whenever the weight changes.
  useEffect(() => {
    if (!shopId || !requestId) return undefined;
    if (estimateTimer.current) clearTimeout(estimateTimer.current);
    estimateTimer.current = setTimeout(async () => {
      try {
        setEstimating(true);
        const res = await api.get('/quotations/delivery-estimate', {
          params: { request_id: requestId, shop_id: shopId, weight: parseFloat(approxWeight) || 0 },
        });
        setEstimate(res.data.data);
      } catch (_e) {
        setEstimate(null);
      } finally {
        setEstimating(false);
      }
    }, 400);
    return () => estimateTimer.current && clearTimeout(estimateTimer.current);
  }, [approxWeight, shopId, requestId]);

  const handleBillSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setBillFile(file);
    setBillPreview(URL.createObjectURL(file));
  };

  const removeBill = () => {
    if (billPreview) URL.revokeObjectURL(billPreview);
    setBillFile(null);
    setBillPreview('');
  };

  const deliveryCharge = estimate ? parseFloat(estimate.delivery_charge) : null;
  const grandTotal =
    (parseFloat(totalAmount) || 0) + (deliveryCharge != null ? deliveryCharge : 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      setLocalError('Please enter the total bill amount.');
      return;
    }
    if (!shopId) {
      setLocalError('Shop not found.');
      return;
    }

    try {
      // 1) Upload the bill photo (if provided) and get its URL.
      let billImageUrl = null;
      if (billFile) {
        setUploading(true);
        const form = new FormData();
        form.append('bill', billFile);
        const up = await api.post('/quotations/upload-bill', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        billImageUrl = up.data.data.url;
        setUploading(false);
      }

      // 2) Create the quotation (delivery charge is auto-calculated server-side).
      dispatch(createQuotation({
        request_id: requestId,
        shop_id: shopId,
        total_amount: parseFloat(totalAmount),
        approx_weight: approxWeight ? parseFloat(approxWeight) : undefined,
        bill_image_url: billImageUrl || undefined,
        notes: notes || undefined,
        payment_method: paymentMethod || undefined,
        valid_until: validUntil || undefined,
      }));
    } catch (err) {
      setUploading(false);
      setLocalError(err.response?.data?.message || 'Failed to upload the bill. Please try again.');
    }
  };

  const shownError = localError || error;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Send Quotation</h1>
        <p className="text-sm text-gray-500 mb-6">
          Upload the bill, enter the total amount and approximate weight. The delivery
          charge is calculated automatically from the weight and distance.
        </p>

        {/* Request Preview */}
        {currentRequest && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <p className="text-sm font-medium text-blue-800 mb-1">For Request:</p>
            <p className="text-sm text-blue-700 whitespace-pre-wrap">{currentRequest.request_text}</p>
            {currentRequest.images && currentRequest.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {currentRequest.images.map((img) => (
                  <a key={img.id} href={mediaUrl(img.image_url)} target="_blank" rel="noopener noreferrer">
                    <img src={mediaUrl(img.image_url)} alt="Order" className="w-16 h-16 object-cover rounded border" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {shownError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {shownError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bill upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bill Photo</label>
            {billPreview ? (
              <div className="relative inline-block">
                <img src={billPreview} alt="Bill preview" className="w-40 h-40 object-cover rounded-lg border" />
                <button
                  type="button"
                  onClick={removeBill}
                  className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-600 hover:border-blue-400 hover:text-blue-600"
                >
                  <span className="text-2xl">📷</span>
                  <span className="text-xs font-medium">Take Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-600 hover:border-blue-400 hover:text-blue-600"
                >
                  <span className="text-2xl">📁</span>
                  <span className="text-xs font-medium">Upload File</span>
                </button>
              </div>
            )}
            {/* Camera capture (mobile) */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleBillSelect}
            />
            {/* File chooser */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBillSelect}
            />
          </div>

          {/* Total amount + weight */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Bill Amount (INR)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Approx. Weight (kg)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={approxWeight}
                onChange={(e) => setApproxWeight(e.target.value)}
                placeholder="0.0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Auto-calculated delivery charge */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Bill Amount</span>
              <span>&#8377;{(parseFloat(totalAmount) || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                Delivery Charge
                {estimate && estimate.distance_km != null && (
                  <span className="text-xs text-gray-400"> ({estimate.distance_km} km)</span>
                )}
              </span>
              <span>
                {estimating ? 'Calculating…' : deliveryCharge != null ? `\u20B9${deliveryCharge.toFixed(2)}` : '—'}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-200">
              <span>Grand Total</span>
              <span className="text-blue-600">&#8377;{grandTotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-400 pt-1">
              Delivery charge is auto-calculated from weight &amp; distance (set by admin).
            </p>
          </div>

          {/* Optional fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any note for the customer..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method (optional)</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Let customer choose</option>
                <option value="upi">UPI</option>
                <option value="cod">Cash on Delivery</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until (optional)</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(`/shop/request/${requestId}`)}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || uploading}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading bill…' : isLoading ? 'Sending…' : 'Send Quotation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuotation;
