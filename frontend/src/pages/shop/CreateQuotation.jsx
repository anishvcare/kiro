import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { createQuotation, clearCreateSuccess } from '../../store/slices/quotationSlice';
import { fetchRequestDetails } from '../../store/slices/requestSlice';

const CreateQuotation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { requestId } = useParams();
  const { currentRequest } = useSelector((state) => state.request);
  const { isLoading, error, createSuccess } = useSelector((state) => state.quotation);
  const { myShops } = useSelector((state) => state.shop);

  const [items, setItems] = useState([{ item_name: '', quantity: 1, unit: '', unit_price: '' }]);
  const [deliveryCharge, setDeliveryCharge] = useState('');
  const [discount, setDiscount] = useState('');
  const [taxAmount, setTaxAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [estimatedPrepTime, setEstimatedPrepTime] = useState('');
  const [validUntil, setValidUntil] = useState('');

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

  const addItem = () => {
    setItems([...items, { item_name: '', quantity: 1, unit: '', unit_price: '' }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    const itemsTotal = items.reduce((sum, item) => {
      return sum + (parseFloat(item.unit_price) || 0) * (parseInt(item.quantity) || 1);
    }, 0);
    const delivery = parseFloat(deliveryCharge) || 0;
    const disc = parseFloat(discount) || 0;
    const tax = parseFloat(taxAmount) || 0;
    return (itemsTotal + delivery - disc + tax).toFixed(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate items
    const validItems = items.filter((item) => item.item_name && item.unit_price);
    if (validItems.length === 0) {
      alert('Please add at least one item with name and price');
      return;
    }

    const shopId = currentRequest?.shop_id || (myShops.length > 0 ? myShops[0].id : null);
    if (!shopId) {
      alert('Shop not found');
      return;
    }

    dispatch(createQuotation({
      request_id: requestId,
      shop_id: shopId,
      items: validItems,
      delivery_charge: parseFloat(deliveryCharge) || 0,
      discount: parseFloat(discount) || 0,
      tax_amount: parseFloat(taxAmount) || 0,
      notes: notes || undefined,
      payment_method: paymentMethod || undefined,
      estimated_prep_time: estimatedPrepTime || undefined,
      valid_until: validUntil || undefined,
    }));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Quotation</h1>

        {/* Request Preview */}
        {currentRequest && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <p className="text-sm font-medium text-blue-800 mb-1">For Request:</p>
            <p className="text-sm text-blue-700 line-clamp-2">{currentRequest.request_text}</p>
            {currentRequest.customer && (
              <p className="text-xs text-blue-600 mt-1">Customer: {currentRequest.customer.name}</p>
            )}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Items */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.item_name}
                      onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                      placeholder="Item name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="w-16">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      min="1"
                      placeholder="Qty"
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => updateItem(index, 'unit', e.target.value)}
                      placeholder="Unit"
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                      step="0.01"
                      min="0"
                      placeholder="Price"
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="p-2 text-red-500 hover:bg-red-50 rounded disabled:opacity-30"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addItem}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add Item
            </button>
          </div>

          {/* Delivery Charge */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Charge</label>
              <input
                type="number"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(e.target.value)}
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax</label>
              <input
                type="number"
                value={taxAmount}
                onChange={(e) => setTaxAmount(e.target.value)}
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Total */}
          <div className="bg-gray-50 rounded-lg p-4 text-right">
            <span className="text-lg font-semibold text-gray-800">
              Total: <span className="text-blue-600">{calculateTotal()}</span>
            </span>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select payment method</option>
              <option value="Cash on Delivery">Cash on Delivery</option>
              <option value="UPI">UPI</option>
              <option value="Online Payment">Online Payment</option>
              <option value="BharatPe">BharatPe</option>
            </select>
          </div>

          {/* Estimated Prep Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Preparation Time</label>
            <select
              value={estimatedPrepTime}
              onChange={(e) => setEstimatedPrepTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select time</option>
              <option value="15 minutes">15 minutes</option>
              <option value="30 minutes">30 minutes</option>
              <option value="45 minutes">45 minutes</option>
              <option value="1 hour">1 hour</option>
              <option value="2 hours">2 hours</option>
              <option value="Same day">Same day</option>
              <option value="Next day">Next day</option>
            </select>
          </div>

          {/* Valid Until */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until (optional)</label>
            <input
              type="datetime-local"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Add any notes for the customer..."
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Quotation'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuotation;
