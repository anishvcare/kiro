import { useState, useEffect } from 'react';
import { Save, Upload, Lock, Eye, EyeOff } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../utils/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      setSettings(res.data.settings);
    } catch (error) {} finally { setLoading(false); }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', { settings });
      toast.success('Settings saved');
    } catch (error) { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/upload/general', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      handleChange('store_logo', res.data.url);
    } catch { toast.error('Upload failed'); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <AdminLayout title="Settings"><LoadingSpinner /></AdminLayout>;

  return (
    <AdminLayout title="Store Settings">
      <div className="max-w-3xl space-y-6">

        {/* Change Password */}
        <div className="card p-5 space-y-4 border-l-4 border-l-accent">
          <div className="flex items-center gap-2">
            <Lock size={20} className="text-accent-600" />
            <h3 className="font-semibold dark:text-white text-lg">Change Password</h3>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="input-field pr-10"
                  placeholder="Enter current password"
                  required
                />
                <button type="button" onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="input-field pr-10"
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="input-field pr-10"
                    placeholder="Re-enter new password"
                    required
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
            <button type="submit" disabled={changingPassword} className="btn-secondary flex items-center gap-2 disabled:opacity-50">
              <Lock size={16} /> {changingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* General */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold dark:text-white text-lg">General</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Store Name</label>
              <input value={settings.store_name || ''} onChange={e => handleChange('store_name', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Phone</label>
              <input value={settings.store_phone || ''} onChange={e => handleChange('store_phone', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">WhatsApp Number</label>
              <input value={settings.whatsapp_number || ''} onChange={e => handleChange('whatsapp_number', e.target.value)} className="input-field" placeholder="91XXXXXXXXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Email</label>
              <input value={settings.store_email || ''} onChange={e => handleChange('store_email', e.target.value)} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Address</label>
            <textarea value={settings.store_address || ''} onChange={e => handleChange('store_address', e.target.value)} className="input-field" rows={2} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Google Map Link</label>
            <input value={settings.google_map_link || ''} onChange={e => handleChange('google_map_link', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Store Logo</label>
            {settings.store_logo && <img src={settings.store_logo} alt="Logo" className="w-20 h-20 object-contain rounded-lg mb-2" />}
            <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-accent w-fit">
              <Upload size={16} /> <span className="text-sm">Upload Logo</span>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Social */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold dark:text-white text-lg">Social Media</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Facebook</label>
              <input value={settings.facebook_url || ''} onChange={e => handleChange('facebook_url', e.target.value)} className="input-field" placeholder="https://" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Instagram</label>
              <input value={settings.instagram_url || ''} onChange={e => handleChange('instagram_url', e.target.value)} className="input-field" placeholder="https://" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Twitter</label>
              <input value={settings.twitter_url || ''} onChange={e => handleChange('twitter_url', e.target.value)} className="input-field" placeholder="https://" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">YouTube</label>
              <input value={settings.youtube_url || ''} onChange={e => handleChange('youtube_url', e.target.value)} className="input-field" placeholder="https://" />
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold dark:text-white text-lg">SEO</h3>
          <div>
            <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Meta Title</label>
            <input value={settings.meta_title || ''} onChange={e => handleChange('meta_title', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Meta Description</label>
            <textarea value={settings.meta_description || ''} onChange={e => handleChange('meta_description', e.target.value)} className="input-field" rows={3} />
          </div>
        </div>

        {/* Inventory */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold dark:text-white text-lg">Inventory</h3>
          <div>
            <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Low Stock Threshold</label>
            <input type="number" value={settings.low_stock_threshold || '5'} onChange={e => handleChange('low_stock_threshold', e.target.value)} className="input-field max-w-xs" />
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
          <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
