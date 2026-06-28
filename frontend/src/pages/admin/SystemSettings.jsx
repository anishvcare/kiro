import { useEffect, useState } from 'react';
import api from '../../services/api';

const SystemSettings = () => {
  const [settings, setSettings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [newSetting, setNewSetting] = useState({ key: '', value: '', type: 'string', description: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      setSettings(response.data.data.settings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = (index, value) => {
    const updated = [...settings];
    updated[index] = { ...updated[index], setting_value: value };
    setSettings(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    try {
      const payload = settings.map((s) => ({
        key: s.setting_key,
        value: s.setting_value,
        type: s.setting_type,
        description: s.description,
      }));
      await api.put('/admin/settings', { settings: payload });
      setMessage('Settings saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSetting = async (e) => {
    e.preventDefault();
    try {
      await api.put('/admin/settings', {
        settings: [newSetting],
      });
      setNewSetting({ key: '', value: '', type: 'string', description: '' });
      setShowAddForm(false);
      loadSettings();
    } catch (error) {
      console.error('Failed to add setting:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Add Setting
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Add Setting Form */}
      {showAddForm && (
        <div className="bg-white shadow rounded-lg p-4">
          <form onSubmit={handleAddSetting} className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-700">Key</label>
              <input type="text" value={newSetting.key} onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value })} required className="mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border px-3 py-1.5" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Value</label>
              <input type="text" value={newSetting.value} onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })} className="mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border px-3 py-1.5" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Type</label>
              <select value={newSetting.type} onChange={(e) => setNewSetting({ ...newSetting, type: e.target.value })} className="mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border px-3 py-1.5">
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Description</label>
              <input type="text" value={newSetting.description} onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })} className="mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border px-3 py-1.5" />
            </div>
            <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">Add</button>
          </form>
        </div>
      )}

      {/* Settings List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {settings.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No settings configured</td>
              </tr>
            ) : (
              settings.map((setting, index) => (
                <tr key={setting.id || setting.setting_key} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{setting.setting_key}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={setting.setting_value || ''}
                      onChange={(e) => handleUpdate(index, e.target.value)}
                      className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border px-2 py-1 w-full max-w-xs"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {setting.setting_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{setting.description || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemSettings;
