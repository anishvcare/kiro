import React, { useState, useRef } from 'react';

const RequestForm = ({ onSubmit, isLoading, shopId }) => {
  const [requestText, setRequestText] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [inputMethod, setInputMethod] = useState('text'); // text, image, list, template
  const fileInputRef = useRef(null);

  const templates = [
    { label: 'Groceries', text: 'I need the following groceries delivered: ' },
    { label: 'Medicine', text: 'I need the following medicines: ' },
    { label: 'Electronics', text: 'I am looking for the following electronic items: ' },
    { label: 'Food Order', text: 'I would like to order: ' },
    { label: 'Custom', text: '' },
  ];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    setImages([...images, ...files]);

    // Create previews
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleTemplateSelect = (template) => {
    setRequestText(template.text);
    setInputMethod('text');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!requestText.trim()) {
      alert('Please describe your request');
      return;
    }

    onSubmit({
      shop_id: shopId,
      request_text: requestText,
      delivery_address: deliveryAddress || undefined,
      urgency,
      scheduled_date: scheduledDate || undefined,
      scheduled_time: scheduledTime || undefined,
      images,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Input Method Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          className={`px-3 py-2 text-sm rounded-t-lg ${inputMethod === 'text' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          onClick={() => setInputMethod('text')}
        >
          Text Input
        </button>
        <button
          type="button"
          className={`px-3 py-2 text-sm rounded-t-lg ${inputMethod === 'image' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          onClick={() => setInputMethod('image')}
        >
          Image Upload
        </button>
        <button
          type="button"
          className={`px-3 py-2 text-sm rounded-t-lg ${inputMethod === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          onClick={() => setInputMethod('list')}
        >
          Shopping List
        </button>
        <button
          type="button"
          className={`px-3 py-2 text-sm rounded-t-lg ${inputMethod === 'template' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          onClick={() => setInputMethod('template')}
        >
          Templates
        </button>
      </div>

      {/* Template Selection */}
      {inputMethod === 'template' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {templates.map((template) => (
            <button
              key={template.label}
              type="button"
              className="p-3 text-sm border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 text-left"
              onClick={() => handleTemplateSelect(template)}
            >
              {template.label}
            </button>
          ))}
        </div>
      )}

      {/* Text Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {inputMethod === 'list' ? 'Enter your shopping list (one item per line)' : 'Describe your request'}
        </label>
        <textarea
          value={requestText}
          onChange={(e) => setRequestText(e.target.value)}
          rows={inputMethod === 'list' ? 8 : 4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={
            inputMethod === 'list'
              ? '1. Rice 5kg\n2. Milk 2 packets\n3. Bread 1 loaf'
              : 'Type your request here...'
          }
          required
        />
      </div>

      {/* Voice Input Button (placeholder) */}
      <div>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50"
          onClick={() => alert('Voice input requires microphone access. This feature will use Web Speech API.')}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          Voice Input
        </button>
      </div>

      {/* Image Upload */}
      {(inputMethod === 'image' || inputMethod === 'text' || inputMethod === 'list') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attach Images (optional, max 5)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative w-20 h-20">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center"
                >
                  x
                </button>
              </div>
            ))}
          </div>
          {images.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Add Image
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
      )}

      {/* Delivery Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Delivery Address
        </label>
        <textarea
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter delivery address..."
        />
      </div>

      {/* Urgency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
        <select
          value={urgency}
          onChange={(e) => setUrgency(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="normal">Normal</option>
          <option value="urgent">Urgent</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      {/* Scheduled Date/Time */}
      {urgency === 'scheduled' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isLoading || !requestText.trim()}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending Request...' : 'Send Request'}
        </button>
      </div>
    </form>
  );
};

export default RequestForm;
