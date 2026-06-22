import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRight } from 'lucide-react';
import api from '../../utils/api';
import StoreLayout from '../../components/store/StoreLayout';
import ProductCard from '../../components/store/ProductCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import InstallPWA from '../../components/pwa/InstallPWA';
import { useStore } from '../../context/StoreContext';

const HomePage = () => {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  const { getSetting } = useStore();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBanner(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const fetchData = async () => {
    try {
      const [bannersRes, categoriesRes, featuredRes, newRes, popularRes] = await Promise.all([
        api.get('/banners?active=true'),
        api.get('/categories?active=true'),
        api.get('/products/featured'),
        api.get('/products/new'),
        api.get('/products/popular')
      ]);
      setBanners(bannersRes.data.banners);
      setCategories(categoriesRes.data.categories);
      setFeatured(featuredRes.data.products);
      setNewProducts(newRes.data.products);
      setPopular(popularRes.data.products);
    } catch (error) {
      console.error('Failed to fetch homepage data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <StoreLayout><LoadingSpinner /></StoreLayout>;

  return (
    <StoreLayout>
      <Helmet>
        <title>{getSetting('meta_title', 'RetailShop - Online Store')}</title>
        <meta name="description" content={getSetting('meta_description', 'Shop the best products')} />
      </Helmet>

      {/* Banner Slider */}
      {banners.length > 0 && (
        <div className="relative overflow-hidden">
          <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentBanner * 100}%)` }}>
            {banners.map((banner) => (
              <div key={banner.id} className="min-w-full aspect-[2/1] sm:aspect-[3/1] relative">
                <img
                  src={banner.image}
                  alt={banner.title || 'Banner'}
                  className="w-full h-full object-cover"
                />
                {(banner.title || banner.subtitle) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-4 sm:p-8 text-white">
                      {banner.title && <h2 className="text-xl sm:text-3xl font-bold">{banner.title}</h2>}
                      {banner.subtitle && <p className="text-sm sm:text-lg opacity-90 mt-1">{banner.subtitle}</p>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Banner dots */}
          {banners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBanner(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${idx === currentBanner ? 'bg-white w-5' : 'bg-white/50'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="page-container">
        {/* Install App Banner */}
        <div className="mt-4 sm:mt-6">
          <InstallPWA variant="banner" />
        </div>

        {/* Categories Grid */}
        {categories.length > 0 && (
          <section className="mt-6 sm:mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold dark:text-white">Categories</h2>
              <Link to="/products" className="text-sm text-accent-600 dark:text-accent-400 font-medium flex items-center gap-0.5">
                View All <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
              {categories.slice(0, 12).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg sm:text-2xl">{cat.name.charAt(0)}</span>
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-center line-clamp-2 dark:text-gray-200">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured Products */}
        {featured.length > 0 && (
          <section className="mt-8 sm:mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold dark:text-white">Featured Products</h2>
              <Link to="/products?featured=true" className="text-sm text-accent-600 dark:text-accent-400 font-medium flex items-center gap-0.5">
                View All <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* New Products */}
        {newProducts.length > 0 && (
          <section className="mt-8 sm:mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold dark:text-white">New Arrivals</h2>
              <Link to="/products?sort=newest" className="text-sm text-accent-600 dark:text-accent-400 font-medium flex items-center gap-0.5">
                View All <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Popular Products */}
        {popular.length > 0 && (
          <section className="mt-8 sm:mt-10 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold dark:text-white">Popular Products</h2>
              <Link to="/products?sort=popular" className="text-sm text-accent-600 dark:text-accent-400 font-medium flex items-center gap-0.5">
                View All <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {popular.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </StoreLayout>
  );
};

export default HomePage;
