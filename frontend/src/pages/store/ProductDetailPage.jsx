import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingCart, Minus, Plus, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../utils/api';
import StoreLayout from '../../components/store/StoreLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { formatPrice, getDiscountPercent, getStockStatus, generateWhatsAppUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const { addToCart } = useCart();
  const { getSetting } = useStore();

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/slug/${slug}`);
      setProduct(res.data.product);
    } catch (error) {
      console.error('Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product.stock_quantity <= 0) {
      toast.error('Product is out of stock');
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      discount_price: product.discount_price,
      image: product.images?.[0]?.image_url || null,
      stock_quantity: product.stock_quantity
    }, quantity);
    toast.success('Added to cart');
  };

  const handleWhatsAppBuy = () => {
    const whatsapp = getSetting('whatsapp_number');
    if (!whatsapp) {
      toast.error('Store WhatsApp not configured');
      return;
    }
    const price = product.discount_price || product.price;
    const message = `Hi! I'd like to order:\n\n${quantity} x ${product.name}\nPrice: ${formatPrice(price * quantity)}\n\nPlease confirm availability.`;
    const url = generateWhatsAppUrl(whatsapp, message);
    window.open(url, '_blank');
  };

  if (loading) return <StoreLayout showBack><LoadingSpinner /></StoreLayout>;
  if (!product) return <StoreLayout showBack><div className="text-center py-12"><p className="text-gray-500">Product not found</p></div></StoreLayout>;

  const discount = getDiscountPercent(product.price, product.discount_price);
  const stockStatus = getStockStatus(product.stock_quantity);
  const images = product.images || [];
  const displayPrice = product.discount_price || product.price;

  return (
    <StoreLayout showBack>
      <Helmet>
        <title>{product.meta_title || product.name}</title>
        <meta name="description" content={product.meta_description || product.short_description || product.description?.substring(0, 160)} />
      </Helmet>

      <div className="page-container py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
              {images.length > 0 ? (
                <img
                  src={images[currentImage]?.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ShoppingCart size={60} />
                </div>
              )}
              
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl">
                  -{discount}% OFF
                </span>
              )}

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage(prev => prev === 0 ? images.length - 1 : prev - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setCurrentImage(prev => prev === images.length - 1 ? 0 : prev + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImage(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${idx === currentImage ? 'border-accent' : 'border-transparent'}`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <span className="text-sm text-accent-600 dark:text-accent-400 font-medium">{product.category_name}</span>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1 dark:text-white">{product.name}</h1>
            
            {product.sku && (
              <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
            )}

            {/* Price */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-3xl font-bold dark:text-white">{formatPrice(displayPrice)}</span>
              {discount > 0 && (
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>
              )}
            </div>

            {/* Stock */}
            <div className="mt-3">
              <span className={`badge badge-${stockStatus.color}`}>{stockStatus.label}</span>
              {product.unit && product.unit !== 'piece' && (
                <span className="text-sm text-gray-500 ml-2">per {product.unit}</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2 dark:text-white">Description</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            {product.stock_quantity > 0 && (
              <div className="mt-6 space-y-4">
                {/* Quantity */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium dark:text-gray-300">Quantity:</span>
                  <div className="flex items-center gap-0 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-11 h-11 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="w-12 text-center font-semibold text-lg dark:text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                      className="w-11 h-11 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button onClick={handleAddToCart} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <ShoppingCart size={18} /> Add to Cart
                  </button>
                  <button onClick={handleWhatsAppBuy} className="btn-secondary flex items-center justify-center gap-2 px-4">
                    <MessageCircle size={18} /> WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
};

export default ProductDetailPage;
