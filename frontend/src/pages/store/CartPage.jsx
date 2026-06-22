import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import StoreLayout from '../../components/store/StoreLayout';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/helpers';

const CartPage = () => {
  const { items, updateQuantity, removeFromCart, getSubtotal, getTotal } = useCart();

  return (
    <StoreLayout showBack title="Cart">
      <Helmet>
        <title>Shopping Cart</title>
      </Helmet>

      <div className="page-container py-4">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold dark:text-white mb-2">Your cart is empty</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Start shopping to add items to your cart</p>
            <Link to="/products" className="btn-primary inline-block">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              <h1 className="text-xl font-bold dark:text-white mb-4">Shopping Cart ({items.length} items)</h1>
              {items.map((item) => {
                const price = item.discount_price || item.price;
                return (
                  <div key={item.id} className="card p-4 flex gap-3">
                    {/* Image */}
                    <div className="w-20 h-20 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingBag size={24} />
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm sm:text-base line-clamp-2 dark:text-white">{item.name}</h3>
                      <p className="text-base font-bold text-primary-900 dark:text-white mt-1">
                        {formatPrice(price)}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity */}
                        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold dark:text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Total & Delete */}
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-sm dark:text-white">{formatPrice(price * item.quantity)}</span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card p-5 sticky top-20">
                <h2 className="text-lg font-bold dark:text-white mb-4">Order Summary</h2>
                
                <div className="space-y-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium dark:text-white">{formatPrice(getSubtotal())}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 mb-5">
                  <span className="text-base font-bold dark:text-white">Grand Total</span>
                  <span className="text-xl font-bold text-accent-600 dark:text-accent-400">{formatPrice(getTotal())}</span>
                </div>

                <Link to="/checkout" className="btn-primary w-full block text-center">
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </StoreLayout>
  );
};

export default CartPage;
