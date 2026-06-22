import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SlidersHorizontal, X } from 'lucide-react';
import api from '../../utils/api';
import StoreLayout from '../../components/store/StoreLayout';
import ProductCard from '../../components/store/ProductCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [showFilters, setShowFilters] = useState(false);

  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentSearch) params.set('search', currentSearch);
      if (currentCategory) params.set('category', currentCategory);
      params.set('sort', currentSort);
      params.set('page', currentPage);
      params.set('status', 'active');

      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories?active=true');
      setCategories(res.data.categories);
    } catch (error) {}
  };

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  return (
    <StoreLayout title="Products" showBack>
      <Helmet>
        <title>Products - Shop Online</title>
      </Helmet>

      <div className="page-container py-4">
        {/* Search info */}
        {currentSearch && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Results for "<strong>{currentSearch}</strong>"
            </span>
            <button onClick={() => updateFilter('search', '')} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Filters Bar */}
        <div className="flex items-center gap-3 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium whitespace-nowrap"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
          
          <select
            value={currentSort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="popular">Most Popular</option>
            <option value="name">Name A-Z</option>
          </select>

          {currentCategory && (
            <button
              onClick={() => updateFilter('category', '')}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-accent/10 text-accent-700 dark:text-accent-400 text-sm font-medium whitespace-nowrap"
            >
              Category <X size={14} />
            </button>
          )}
        </div>

        {/* Category filter panel */}
        {showFilters && (
          <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold mb-2 dark:text-white">Categories</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilter('category', '')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!currentCategory ? 'bg-accent text-primary-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => updateFilter('category', cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentCategory == cat.id ? 'bg-accent text-primary-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No products found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => updateFilter('page', page)}
                    className={`w-10 h-10 rounded-xl font-medium transition-colors ${page === pagination.page ? 'bg-accent text-primary-900' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </StoreLayout>
  );
};

export default ProductsPage;
