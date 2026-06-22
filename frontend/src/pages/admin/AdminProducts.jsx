import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Trash2, Edit, MoreVertical } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../utils/api';
import { formatPrice } from '../../utils/helpers';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({});
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      const res = await api.get(`/products?${params}`);
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    if (!confirm(`Delete ${selected.length} products?`)) return;
    try {
      await api.post('/products/bulk-delete', { ids: selected });
      toast.success(`${selected.length} products deleted`);
      setSelected([]);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete products');
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selected.length === products.length) {
      setSelected([]);
    } else {
      setSelected(products.map(p => p.id));
    }
  };

  return (
    <AdminLayout title="Products">
      {/* Actions bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2">
          {selected.length > 0 && (
            <button onClick={handleBulkDelete} className="px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium">
              Delete ({selected.length})
            </button>
          )}
          <Link to="/admin/products/new" className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus size={18} /> Add Product
          </Link>
        </div>
      </div>

      {/* Products table */}
      {loading ? <LoadingSpinner /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input type="checkbox" checked={selected.length === products.length && products.length > 0} onChange={toggleSelectAll} className="rounded" />
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Stock</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {products.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No products found</td></tr>
                ) : (
                  products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.includes(product.id)} onChange={() => toggleSelect(product.id)} className="rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                            {product.image && <img src={product.image} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <p className="font-medium dark:text-white line-clamp-1">{product.name}</p>
                            {product.sku && <p className="text-xs text-gray-500">SKU: {product.sku}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{product.category_name}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium dark:text-white">{formatPrice(product.discount_price || product.price)}</span>
                        {product.discount_price && <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(product.price)}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${product.stock_quantity <= 5 ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${product.status === 'active' ? 'badge-success' : product.status === 'inactive' ? 'badge-danger' : 'badge-warning'}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/admin/products/${product.id}/edit`} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg">
                            <Edit size={16} />
                          </Link>
                          <button onClick={() => handleDelete(product.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500">Showing {products.length} of {pagination.total}</p>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium ${p === page ? 'bg-accent text-primary-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
