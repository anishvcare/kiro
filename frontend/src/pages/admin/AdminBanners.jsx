import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../utils/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: '', subtitle: '', image: '', link: '', display_order: 0, is_active: true });

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    try {
      const res = await api.get('/banners');
      setBanners(res.data.banners);
    } catch (error) {} finally { setLoading(false); }
  };

  const openModal = (banner = null) => {
    if (banner) {
      setEditId(banner.id);
      setForm({ title: banner.title || '', subtitle: banner.subtitle || '', image: banner.image || '', link: banner.link || '', display_order: banner.display_order, is_active: !!banner.is_active });
    } else {
      setEditId(null);
      setForm({ title: '', subtitle: '', image: '', link: '', display_order: 0, is_active: true });
    }
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/upload/banners', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(prev => ({ ...prev, image: res.data.url }));
    } catch { toast.error('Upload failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/banners/${editId}`, form);
        toast.success('Banner updated');
      } else {
        await api.post('/banners', form);
        toast.success('Banner created');
      }
      setShowModal(false);
      fetchBanners();
    } catch (error) { toast.error('Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this banner?')) return;
    try {
      await api.delete(`/banners/${id}`);
      toast.success('Deleted');
      fetchBanners();
    } catch (error) { toast.error('Failed to delete'); }
  };

  if (loading) return <AdminLayout title="Banners"><LoadingSpinner /></AdminLayout>;

  return (
    <AdminLayout title="Banners">
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-gray-500 dark:text-gray-400">{banners.length} banners</p>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Banner</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {banners.map(banner => (
          <div key={banner.id} className="card overflow-hidden">
            <div className="aspect-[3/1] bg-gray-100 dark:bg-gray-700 relative">
              {banner.image && <img src={banner.image} alt="" className="w-full h-full object-cover" />}
              {!banner.is_active && <span className="absolute top-2 right-2 badge badge-danger">Inactive</span>}
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium dark:text-white">{banner.title || 'Untitled'}</h3>
                <p className="text-xs text-gray-500">Order: {banner.display_order}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openModal(banner)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"><Edit size={16} /></button>
                <button onClick={() => handleDelete(banner.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold dark:text-white mb-4">{editId ? 'Edit' : 'New'} Banner</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Title</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Subtitle</label>
                <input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Image *</label>
                {form.image && <img src={form.image} alt="" className="w-full h-20 object-cover rounded-lg mb-2" />}
                <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-accent">
                  <Upload size={16} /> <span className="text-sm">Upload Image</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Order</label>
                  <input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} className="input-field" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded" />
                    <span className="text-sm dark:text-gray-300">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">{editId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBanners;
