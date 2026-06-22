import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, X, Save } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../utils/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    name: '', description: '', short_description: '', category_id: '',
    sku: '', price: '', discount_price: '', stock_quantity: '0',
    low_stock_threshold: '5', unit: 'piece', weight: '',
    is_featured: false, is_popular: false, status: 'active',
    meta_title: '', meta_description: ''
  });

  useEffect(() => {
    fetchCategories();
    if (isEdit) fetchProduct();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.categories);
    } catch (error) {}
  };

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      const p = res.data.product;
      setForm({
        name: p.name || '', description: p.description || '',
        short_description: p.short_description || '', category_id: p.category_id || '',
        sku: p.sku || '', price: p.price || '', discount_price: p.discount_price || '',
        stock_quantity: p.stock_quantity || '0', low_stock_threshold: p.low_stock_threshold || '5',
        unit: p.unit || 'piece', weight: p.weight || '',
        is_featured: !!p.is_featured, is_popular: !!p.is_popular,
        status: p.status || 'active', meta_title: p.meta_title || '',
        meta_description: p.meta_description || ''
      });
      if (p.images) {
        setImages(p.images.map(img => ({ url: img.image_url, alt: img.alt_text, id: img.id })));
      }
    } catch (error) {
      toast.error('Product not found');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    for (let file of files) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await api.post('/upload/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setImages(prev => [...prev, { url: res.data.url, alt: form.name }]);
      } catch (error) {
        toast.error('Image upload failed');
      }
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, images: images.map(img => ({ url: img.url, alt: img.alt })) };
      
      if (isEdit) {
        await api.put(`/products/${id}`, data);
        toast.success('Product updated');
      } else {
        await api.post('/products', data);
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLayout title={isEdit ? 'Edit Product' : 'New Product'}><LoadingSpinner /></AdminLayout>;

  return (
    <AdminLayout title={isEdit ? 'Edit Product' : 'New Product'}>
      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            <div className="card p-5 space-y-4">
              <h3 className="font-semibold dark:text-white">Basic Information</h3>
              <div>
                <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Product Name *</label>
                <input name="name" value={form.name} onChange={handleChange} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Short Description</label>
                <input name="short_description" value={form.short_description} onChange={handleChange} className="input-field" maxLength={500} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Full Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={5} className="input-field" />
              </div>
            </div>

            {/* Images */}
            <div className="card p-5">
              <h3 className="font-semibold dark:text-white mb-4">Product Images</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden group">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                    {idx === 0 && <span className="absolute bottom-1 left-1 text-[10px] bg-accent text-primary-900 px-1.5 py-0.5 rounded font-medium">Primary</span>}
                  </div>
                ))}
                <label className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-accent transition-colors">
                  <Upload size={20} className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Upload</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Pricing */}
            <div className="card p-5 space-y-4">
              <h3 className="font-semibold dark:text-white">Pricing & Inventory</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Price *</label>
                  <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Discount Price</label>
                  <input name="discount_price" type="number" step="0.01" value={form.discount_price} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Stock Quantity</label>
                  <input name="stock_quantity" type="number" value={form.stock_quantity} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Low Stock Threshold</label>
                  <input name="low_stock_threshold" type="number" value={form.low_stock_threshold} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">SKU</label>
                  <input name="sku" value={form.sku} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Unit</label>
                  <select name="unit" value={form.unit} onChange={handleChange} className="input-field">
                    <option value="piece">Piece</option>
                    <option value="kg">Kg</option>
                    <option value="g">Gram</option>
                    <option value="l">Litre</option>
                    <option value="ml">ml</option>
                    <option value="dozen">Dozen</option>
                    <option value="pack">Pack</option>
                    <option value="box">Box</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="card p-5 space-y-4">
              <h3 className="font-semibold dark:text-white">SEO</h3>
              <div>
                <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Meta Title</label>
                <input name="meta_title" value={form.meta_title} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Meta Description</label>
                <textarea name="meta_description" value={form.meta_description} onChange={handleChange} rows={3} className="input-field" />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="card p-5 space-y-4">
              <h3 className="font-semibold dark:text-white">Organization</h3>
              <div>
                <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Category *</label>
                <select name="category_id" value={form.category_id} onChange={handleChange} className="input-field" required>
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="input-field">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Weight</label>
                <input name="weight" value={form.weight} onChange={handleChange} className="input-field" placeholder="e.g. 500g" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-accent" />
                <span className="text-sm font-medium dark:text-gray-300">Featured Product</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_popular" checked={form.is_popular} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-accent" />
                <span className="text-sm font-medium dark:text-gray-300">Popular Product</span>
              </label>
            </div>

            {/* Save */}
            <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              <Save size={18} /> {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminProductForm;
