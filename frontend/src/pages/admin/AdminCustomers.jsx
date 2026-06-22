import { useState, useEffect } from 'react';
import { Search, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../utils/api';
import { formatPrice } from '../../utils/helpers';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => { fetchCustomers(); }, [page, search]);

  const fetchCustomers = async () => {
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      const res = await api.get(`/customers?${params}`);
      setCustomers(res.data.customers);
      setPagination(res.data.pagination);
    } catch (error) {} finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return;
    try {
      await api.delete(`/customers/${id}`);
      toast.success('Customer deleted');
      fetchCustomers();
    } catch (error) { toast.error('Failed to delete'); }
  };

  return (
    <AdminLayout title="Customers">
      <div className="mb-5">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search customers..." className="input-field pl-10" />
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Orders</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Total Spent</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Joined</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {customers.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No customers found</td></tr>
                ) : customers.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 font-medium dark:text-white">{c.name}</td>
                    <td className="px-4 py-3 dark:text-gray-300">{c.phone}</td>
                    <td className="px-4 py-3 dark:text-gray-300">{c.total_orders}</td>
                    <td className="px-4 py-3 font-medium dark:text-white">{formatPrice(c.total_spent)}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCustomers;
