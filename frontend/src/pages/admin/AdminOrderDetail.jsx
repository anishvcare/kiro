import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../utils/api';
import { formatPrice, getOrderStatusColor } from '../../utils/helpers';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrder(); }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.order);
    } catch (error) { toast.error('Order not found'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      toast.success('Status updated');
      fetchOrder();
    } catch (error) { toast.error('Failed to update status'); }
  };

  if (loading) return <AdminLayout title="Order Details"><LoadingSpinner /></AdminLayout>;
  if (!order) return <AdminLayout title="Order Details"><p className="text-center py-8 text-gray-500">Order not found</p></AdminLayout>;

  return (
    <AdminLayout title={`Order ${order.order_number}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="card p-5">
            <h3 className="font-semibold dark:text-white mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items?.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium dark:text-white">{item.product_name}</p>
                    <p className="text-sm text-gray-500">{item.quantity} x {formatPrice(item.discount_price || item.unit_price)}</p>
                  </div>
                  <span className="font-semibold dark:text-white">{formatPrice(item.total_price)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="dark:text-white">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount_total > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-green-600">-{formatPrice(order.discount_total)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="dark:text-white">Total</span>
                <span className="text-accent-600">{formatPrice(order.grand_total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Status */}
          <div className="card p-5">
            <h3 className="font-semibold dark:text-white mb-3">Order Status</h3>
            <span className={`badge badge-${getOrderStatusColor(order.status)} text-sm`}>{order.status}</span>
            <div className="mt-4 space-y-2">
              {['pending', 'confirmed', 'processing', 'delivered', 'cancelled'].map(s => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  disabled={order.status === s}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-colors disabled:opacity-50 ${order.status === s ? 'bg-accent/10 text-accent-700 font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Customer */}
          <div className="card p-5">
            <h3 className="font-semibold dark:text-white mb-3">Customer</h3>
            <div className="space-y-2 text-sm">
              <p className="dark:text-gray-300"><strong>Name:</strong> {order.customer_name}</p>
              <p className="dark:text-gray-300"><strong>Phone:</strong> {order.customer_phone}</p>
              {order.customer_address && <p className="dark:text-gray-300"><strong>Address:</strong> {order.customer_address}</p>}
              {order.customer_landmark && <p className="dark:text-gray-300"><strong>Landmark:</strong> {order.customer_landmark}</p>}
              {order.notes && <p className="dark:text-gray-300"><strong>Notes:</strong> {order.notes}</p>}
            </div>
          </div>

          {/* Info */}
          <div className="card p-5">
            <h3 className="font-semibold dark:text-white mb-3">Order Info</h3>
            <div className="space-y-2 text-sm">
              <p className="dark:text-gray-300"><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
              <p className="dark:text-gray-300"><strong>Source:</strong> {order.order_source}</p>
              <p className="dark:text-gray-300"><strong>Payment:</strong> {order.payment_method}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetail;
