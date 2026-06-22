import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MessageCircle, ShoppingBag } from 'lucide-react';
import StoreLayout from '../../components/store/StoreLayout';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { formatPrice, generateWhatsAppUrl, generateOrderMessage } from '../../utils/helpers';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { items, getTotal, clearCart } = useCart();
  const { getSetting } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    customer_landmark: '',
    notes: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.customer_name || !form.customer_phone) {
      toast.error('Please fill in required fields');
      return;
    }

    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setLoading(true);
    try {
      // Place order via API
      const orderData = {
        ...form,
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      };

      const res = await api.post('/orders', orderData);
      const orderResult = res.data.order;

      // Generate WhatsApp message
      const whatsappNumber = getSetting('whatsapp_number');
      if (whatsappNumber) {
        const message = generateOrderMessage(
          { ...form, order_number: orderResult.order_number, grand_total: getTotal() },
          items,
          {}
        );
        const whatsappUrl = generateWhatsAppUrl(whatsappNumber, message);
        window.open(whatsappUrl, '_blank');
      }

      // Clear cart and redirect
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <StoreLayout showBack title="Checkout">
      <Helmet>
        <title>Checkout</title>
      </Helmet>

      <div className="page-container py-4">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Details */}
            <div className="lg:col-span-2 space-y-4">
              <h1 className="text-xl font-bold dark:text-white mb-4">Delivery Details</h1>
              
              <div className="card p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Name *</label>
                  <input
                    type="text"
                    name="customer_name"
                    value={form.customer_name}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Mobile Number *</label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={form.customer_phone}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Enter your mobile number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Delivery Address</label>
                  <textarea
                    name="customer_address"
                    value={form.customer_address}
                    onChange={handleChange}
                    rows={3}
                    className="input-field"
                    placeholder="Enter your full delivery address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Landmark</label>
                  <input
                    type="text"
                    name="customer_landmark"
                    value={form.customer_landmark}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Near any landmark?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Order Notes</label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={2}
                    className="input-field"
                    placeholder="Any special instructions?"
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card p-5 sticky top-20">
                <h2 className="text-lg font-bold dark:text-white mb-4">Order Summary</h2>
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {items.map((item) => {
                    const price = item.discount_price || item.price;
                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={14} /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1 dark:text-white">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.quantity} x {formatPrice(price)}</p>
                        </div>
                        <span className="text-sm font-semibold dark:text-white">{formatPrice(price * item.quantity)}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold dark:text-white">Total</span>
                    <span className="text-xl font-bold text-accent-600 dark:text-accent-400">{formatPrice(getTotal())}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <MessageCircle size={18} />
                  {loading ? 'Placing Order...' : 'Place Order & Send WhatsApp'}
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                  Your order will be sent to the store via WhatsApp
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </StoreLayout>
  );
};

export default CheckoutPage;
