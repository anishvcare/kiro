import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ClipboardDocumentIcon,
  DevicePhoneMobileIcon,
  CameraIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

const UPIPayment = ({ paymentData, onScreenshotUpload, isUploading }) => {
  const [copied, setCopied] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const {
    upi_id,
    deep_link,
    qr_code,
    shop_name,
    shop_phone,
    amount,
    transaction_id,
  } = paymentData || {};

  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handlePayNow = () => {
    if (deep_link) {
      window.location.href = deep_link;
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUploadScreenshot = () => {
    if (selectedFile && onScreenshotUpload) {
      onScreenshotUpload(selectedFile);
    }
  };

  if (!paymentData) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* QR Code Section */}
      <div className="flex flex-col items-center">
        <p className="text-sm text-gray-600 mb-2">Scan QR code to pay</p>
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
          {qr_code ? (
            <img src={qr_code} alt="UPI QR Code" className="w-48 h-48" />
          ) : deep_link ? (
            <QRCodeSVG value={deep_link} size={192} level="M" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-gray-400">
              QR Code unavailable
            </div>
          )}
        </div>
        <p className="text-lg font-semibold mt-2 text-gray-800">
          Amount: &#8377;{parseFloat(amount).toFixed(2)}
        </p>
      </div>

      {/* UPI ID Copy */}
      {upi_id && (
        <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">UPI ID</p>
            <p className="font-medium text-gray-800">{upi_id}</p>
          </div>
          <button
            onClick={() => handleCopy(upi_id, 'upi')}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
          >
            {copied === 'upi' ? (
              <>
                <CheckIcon className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        </div>
      )}

      {/* Phone Number Copy */}
      {shop_phone && (
        <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Phone Number</p>
            <p className="font-medium text-gray-800">{shop_phone}</p>
          </div>
          <button
            onClick={() => handleCopy(shop_phone, 'phone')}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
          >
            {copied === 'phone' ? (
              <>
                <CheckIcon className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        </div>
      )}

      {/* Pay Now Button - Opens UPI deep link */}
      {deep_link && (
        <button
          onClick={handlePayNow}
          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          <DevicePhoneMobileIcon className="w-5 h-5" />
          Pay Now (Opens UPI App)
        </button>
      )}

      {/* Payment Apps Info */}
      <p className="text-xs text-center text-gray-500">
        Opens Google Pay, PhonePe, Paytm, BHIM, or other UPI apps
      </p>

      {/* Screenshot Upload Section */}
      <div className="border-t pt-4 mt-4">
        <p className="text-sm font-medium text-gray-700 mb-2">
          Upload Payment Screenshot
        </p>
        <p className="text-xs text-gray-500 mb-3">
          After making payment, upload a screenshot for verification
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {previewUrl && (
          <div className="mb-3">
            <img
              src={previewUrl}
              alt="Screenshot preview"
              className="w-full max-h-48 object-contain rounded border"
            />
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2 px-3 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            <CameraIcon className="w-4 h-4" />
            {selectedFile ? 'Change File' : 'Select Screenshot'}
          </button>

          {selectedFile && (
            <button
              onClick={handleUploadScreenshot}
              disabled={isUploading}
              className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          )}
        </div>
      </div>

      {/* Transaction ID */}
      {transaction_id && (
        <div className="text-center mt-2">
          <p className="text-xs text-gray-400">
            Transaction ID: {transaction_id}
          </p>
        </div>
      )}
    </div>
  );
};

export default UPIPayment;
