import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, FolderOpen, ShoppingCart, Users, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../utils/api';
import { formatPrice, getOrderStatusColor } from '../../utils/helpers';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const StatCard = ({ icon: Icon, label, value, subValue, color, to }) => (
  <Link to={to || '#'} className="card p-4 sm:p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      {subValue && <p className="text-xs text-accent-600 dark:text-accent-400 mt-0.5">{subValue}</p>}
    </div>
  </Link>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data.stats);
      setRecentOrders(res.data.recentOrders);
    } catch (error) {
      console.error('Failed to fetch dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <AdminLayout title="Dashboard"><LoadingSpinner /></AdminLayout>;

  return (
    <AdminLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard icon={Package} label="Products" value={stats?.totalProducts || 0} color="bg-blue-500" to="/admin/products" />
        <StatCard icon={FolderOpen} label="Categories" value={stats?.totalCategories || 0} color="bg-purple-500" to="/admin/categories" />
        <StatCard icon={ShoppingCart} label="Orders" value={stats?.totalOrders || 0} color="bg-green-500" to="/admin/orders" />
        <StatCard icon={Users} label="Customers" value={stats?.totalCustomers || 0} color="bg-orange-500" to="/admin/customers" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <StatCard
          icon={AlertTriangle}
          label="Low Stock Items"
          value={stats?.lowStockProducts || 0}
          color="bg-red-500"
          to="/admin/inventory"
        />
        <StatCard
          icon={Calendar}
          label="Today's Orders"
          value={stats?.todayOrders || 0}
          subValue={`Revenue: ${formatPrice(stats?.todayRevenue || 0)}`}
          color="bg-teal-500"
          to="/admin/orders"
        />
        <StatCard
          icon={TrendingUp}
          label="Monthly Orders"
          value={stats?.monthOrders || 0}
          subValue={`Revenue: ${formatPrice(stats?.monthRevenue || 0)}`}
          color="bg-indigo-500"
          to="/admin/orders"
        />
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-bold dark:text-white">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-accent-600 dark:text-accent-400 font-medium">View All →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Order</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Total</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No orders yet</td>
                </tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      <Link to={`/admin/orders/${order.id}`} className="font-medium text-accent-600 dark:text-accent-400">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 dark:text-gray-300">{order.customer_name}</td>
                    <td className="px-4 py-3 font-medium dark:text-white">{formatPrice(order.grand_total)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge badge-${getOrderStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
