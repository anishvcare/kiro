import React, { useState } from 'react';
import {
  CogIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const providers = [
  {
    id: 'bharatpe',
    name: 'BharatPe',
    description: 'Primary UPI payment gateway with merchant support',
    status: 'active',
    fields: ['merchant_id', 'api_key', 'api_secret', 'webhook_secret'],
  },
  {
    id: 'manual_upi',
    name: 'Manual UPI',
    description: 'Fallback - generates UPI deep links and QR codes for manual verification',
    status: 'active',
    fields: [],
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    description: 'Popular payment gateway (placeholder)',
    status: 'inactive',
    fields: ['key_id', 'key_secret'],
  },
  {
    id: 'payu',
    name: 'PayU',
    description: 'PayU Money payment gateway (placeholder)',
    status: 'inactive',
    fields: ['merchant_key', 'merchant_salt'],
  },
  {
    id: 'cashfree',
    name: 'Cashfree',
    description: 'Cashfree payments gateway (placeholder)',
    status: 'inactive',
    fields: ['app_id', 'secret_key'],
  },
];

const PaymentSettings = () => {
  const [activeProvider, setActiveProvider] = useState('bharatpe');
  const [config, setConfig] = useState({});
  const [saved, setSaved] = useState(false);

  const handleConfigChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    // In production, this would call the API to save settings
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleProviderToggle = (providerId) => {
    setActiveProvider(providerId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <CogIcon className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-800">Payment Settings</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Configure payment providers and gateway settings
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Success Message */}
        {saved && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-700">Settings saved successfully</span>
          </div>
        )}

        {/* Primary Provider Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Primary Provider</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleProviderToggle(provider.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  activeProvider === provider.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-800">{provider.name}</span>
                  {activeProvider === provider.id && (
                    <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <p className="text-xs text-gray-500">{provider.description}</p>
                <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${
                  provider.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {provider.status === 'active' ? 'Available' : 'Placeholder'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Provider Configuration */}
        {providers.find((p) => p.id === activeProvider)?.fields.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {providers.find((p) => p.id === activeProvider)?.name} Configuration
            </h2>
            <div className="space-y-4">
              {providers.find((p) => p.id === activeProvider)?.fields.map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium text-gray-700 block mb-1 capitalize">
                    {field.replace(/_/g, ' ')}
                  </label>
                  <input
                    type={field.includes('secret') || field.includes('key') ? 'password' : 'text'}
                    value={config[field] || ''}
                    onChange={(e) => handleConfigChange(field, e.target.value)}
                    placeholder={`Enter ${field.replace(/_/g, ' ')}`}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleSave}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Save Configuration
            </button>
          </div>
        )}

        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">General Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Auto-fallback to Manual UPI</p>
                <p className="text-xs text-gray-500">
                  If primary provider fails, automatically use Manual UPI with QR code
                </p>
              </div>
              <div className="w-10 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Allow Cash on Delivery</p>
                <p className="text-xs text-gray-500">
                  Enable COD option for customers
                </p>
              </div>
              <div className="w-10 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Screenshot Verification Required</p>
                <p className="text-xs text-gray-500">
                  Require payment screenshot for UPI payments
                </p>
              </div>
              <div className="w-10 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;
