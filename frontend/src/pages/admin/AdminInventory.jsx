import { useState, useEffect } from 'react';
import { AlertTriangle, Save } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../utils/api';
import { formatPrice } from '../../utils/helpers';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editStock, setEditStock] = useState({});

  useEffect(() => { fetchLowStock(); }, []);

  const fetchLowStock = async () => {
    try {
      const res = await api.get('/products/low-stock');
      setProducts(res.data.products);
    } catch (error) {} finally { setLoading(false); }
  };

  const handleStockChange = (id, value) => {
    setEditStock(prev => ({ ...prev, [id]: value }));
  };

  const updateStock = async (id) => {
    const newStock = editStock[id];
    if (newStock === undefined) return;
    try {
      await api.patch(`/products/${id}/stock`, { stock_quantity: parseInt(newStock) });
      toast.success('Stock updated');
      fetchLowStock();
      setEditStock(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
    } catch (error) { toast.error('Failed to update'); }
  };

  if (loading) return <AdminLayout title="Inventory"><LoadingSpinner /></AdminLayout>;

  return (
    <AdminLayout title="Inventory Management">
      <div className="mb-5">
        <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            Showing {products.length} products with low or zero stock
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Product</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Current Stock</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Threshold</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Update Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {products.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">All products are well stocked!</td></tr>
              ) : products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <span className="font-medium dark:text-white">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 dark:text-gray-300">{p.category_name}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${p.stock_quantity === 0 ? 'text-red-500' : 'text-yellow-600'}`}>
                      {p.stock_quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.low_stock_threshold}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={editStock[p.id] !== undefined ? editStock[p.id] : p.stock_quantity}
                        onChange={e => handleStockChange(p.id, e.target.value)}
                        className="input-field w-20 py-1.5 text-sm"
                      />
                      <button onClick={() => updateStock(p.id)} className="p-2 bg-accent hover:bg-accent-500 text-primary-900 rounded-lg">
                        <Save size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminInventory;
