import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../utils/api';
import { formatPrice, getOrderStatusColor } from '../../utils/helpers';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => { fetchOrders(); }, [page, search, status]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const res = await api.get(`/orders?${params}`);
      setOrders(res.data.orders);
      setPagination(res.data.pagination);
    } catch (error) {} finally { setLoading(false); }
  };

  return (
    <AdminLayout title="Orders">
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search orders..." className="input-field pl-10" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input-field w-auto">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Order</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Date</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {orders.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No orders found</td></tr>
                ) : orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 font-medium dark:text-white">{order.order_number}</td>
                    <td className="px-4 py-3 dark:text-gray-300">{order.customer_name}</td>
                    <td className="px-4 py-3 dark:text-gray-300">{order.customer_phone}</td>
                    <td className="px-4 py-3 font-medium dark:text-white">{formatPrice(order.grand_total)}</td>
                    <td className="px-4 py-3"><span className={`badge badge-${getOrderStatusColor(order.status)}`}>{order.status}</span></td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/admin/orders/${order.id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg inline-flex"><Eye size={16} /></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-1 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium ${p === page ? 'bg-accent text-primary-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'}`}>{p}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
