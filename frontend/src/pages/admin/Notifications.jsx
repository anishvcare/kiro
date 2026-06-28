import { useState } from 'react';
import api from '../../services/api';

const Notifications = () => {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'system',
  });
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');
  const [sentNotifications, setSentNotifications] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setMessage('');

    try {
      const response = await api.post('/admin/notifications', formData);
      const count = response.data.data.recipientCount;
      setMessage(`Notification sent to ${count} user(s) successfully`);
      setSentNotifications((prev) => [
        { ...formData, sentAt: new Date().toISOString(), recipientCount: count },
        ...prev,
      ]);
      setFormData({ title: '', body: '', type: 'system' });
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Send Notifications</h1>

      {message && (
        <div className={`p-4 rounded-md ${message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Send Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">New Notification</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
              placeholder="Notification title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Body *</label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              required
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
              placeholder="Notification message"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="mt-1 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
            >
              <option value="system">System</option>
              <option value="promotion">Promotion</option>
              <option value="maintenance">Maintenance</option>
              <option value="update">Update</option>
            </select>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSending}
              className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSending ? 'Sending...' : 'Send to All Users'}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Sent Notifications */}
      {sentNotifications.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recently Sent</h2>
          <div className="space-y-3">
            {sentNotifications.map((notif, idx) => (
              <div key={idx} className="border border-gray-200 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">{notif.title}</h3>
                  <span className="text-xs text-gray-500">{new Date(notif.sentAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{notif.body}</p>
                <div className="mt-2 flex items-center space-x-3 text-xs text-gray-500">
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100">{notif.type}</span>
                  <span>Sent to {notif.recipientCount} users</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
