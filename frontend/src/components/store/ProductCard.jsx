import { Link } from 'react-router-dom';
import { ShoppingCart, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice, getDiscountPercent, getStockStatus } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const discount = getDiscountPercent(product.price, product.discount_price);
  const stockStatus = getStockStatus(product.stock_quantity);
  const displayPrice = product.discount_price || product.price;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock_quantity <= 0) {
      toast.error('Product is out of stock');
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      discount_price: product.discount_price,
      image: product.image,
      stock_quantity: product.stock_quantity
    });
    toast.success('Added to cart');
  };

  return (
    <Link to={`/products/${product.slug}`} className="card group block">
      {/* Image */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ShoppingCart size={40} />
          </div>
        )}
        
        {/* Discount badge */}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            -{discount}%
          </span>
        )}

        {/* Stock status */}
        {product.stock_quantity <= 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-primary-900 font-semibold px-3 py-1.5 rounded-lg text-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <h3 className="font-medium text-sm sm:text-base line-clamp-2 text-primary-900 dark:text-white mb-1.5">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-bold text-primary-900 dark:text-white">
              {formatPrice(displayPrice)}
            </span>
            {discount > 0 && (
              <span className="text-xs sm:text-sm text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          
          {product.stock_quantity > 0 && (
            <button
              onClick={handleAddToCart}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-accent hover:bg-accent-500 text-primary-900 rounded-xl flex items-center justify-center active:scale-90 transition-all touch-manipulation"
            >
              <Plus size={18} />
            </button>
          )}
        </div>

        {product.unit && product.unit !== 'piece' && (
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">per {product.unit}</span>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
