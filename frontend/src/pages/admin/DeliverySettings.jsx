import { useEffect, useState } from 'react';
import api from '../../services/api';

const DeliverySettings = () => {
  const [settings, setSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/admin/delivery-settings');
      setSettings(response.data.data.settings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    try {
      const response = await api.put('/admin/delivery-settings', { settings });
      setSettings(response.data.data.settings);
      setMessage('Settings saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const settingFields = [
    { key: 'delivery_base_charge', label: 'Base Delivery Charge', type: 'number', suffix: 'INR' },
    { key: 'delivery_per_km_charge', label: 'Per KM Charge', type: 'number', suffix: 'INR' },
    { key: 'delivery_per_kg_charge', label: 'Per KG Charge (weight)', type: 'number', suffix: 'INR' },
    { key: 'delivery_free_threshold', label: 'Free Delivery Threshold', type: 'number', suffix: 'INR' },
    { key: 'delivery_max_radius_km', label: 'Maximum Delivery Radius', type: 'number', suffix: 'km' },
    { key: 'platform_commission_percent', label: 'Platform Commission', type: 'number', suffix: '%' },
    { key: 'delivery_agent_commission_percent', label: 'Delivery Agent Commission', type: 'number', suffix: '%' },
    { key: 'minimum_order_amount', label: 'Minimum Order Amount', type: 'number', suffix: 'INR' },
    { key: 'delivery_boy_payout_per_delivery', label: 'Delivery Boy Payout (per delivery)', type: 'number', suffix: 'INR' },
    { key: 'express_delivery_surcharge', label: 'Express Delivery Surcharge', type: 'number', suffix: 'INR' },
    { key: 'cash_on_delivery_enabled', label: 'Cash on Delivery', type: 'toggle' },
  ];

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Delivery Settings</h1>

      {message && (
        <div className={`p-4 rounded-md ${message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-medium">How the delivery charge is calculated</p>
        <p className="mt-1">
          <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200">
            Delivery Charge = Base Charge + (Per&nbsp;KM&nbsp;Charge × distance&nbsp;km) + (Per&nbsp;KG&nbsp;Charge × weight&nbsp;kg)
          </code>
        </p>
        <p className="mt-1 text-blue-700">
          Distance is measured between the shop and the customer&apos;s delivery location; weight is the
          approximate weight the shop enters on the quotation. Adjust the three rates below to control it.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingFields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              {field.type === 'toggle' ? (
                <label className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={settings[field.key] === 'true' || settings[field.key] === true}
                    onChange={(e) => handleChange(field.key, e.target.checked ? 'true' : 'false')}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    {settings[field.key] === 'true' ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              ) : (
                <div className="flex items-center">
                  <input
                    type="number"
                    value={settings[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                    step="any"
                  />
                  {field.suffix && (
                    <span className="ml-2 text-sm text-gray-500 whitespace-nowrap">{field.suffix}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeliverySettings;
