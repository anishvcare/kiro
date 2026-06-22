import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../../utils/api';
import StoreLayout from '../../components/store/StoreLayout';
import ProductCard from '../../components/store/ProductCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const CategoryPage = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategory();
  }, [slug]);

  const fetchCategory = async () => {
    setLoading(true);
    try {
      const catRes = await api.get(`/categories/slug/${slug}`);
      setCategory(catRes.data.category);
      
      const prodsRes = await api.get(`/products?category=${catRes.data.category.id}&status=active`);
      setProducts(prodsRes.data.products);
    } catch (error) {
      console.error('Failed to fetch category');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <StoreLayout showBack><LoadingSpinner /></StoreLayout>;

  return (
    <StoreLayout showBack title={category?.name}>
      <Helmet>
        <title>{category?.name || 'Category'} - Shop</title>
      </Helmet>

      <div className="page-container py-4">
        {category && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold dark:text-white">{category.name}</h1>
            {category.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">{category.description}</p>
            )}
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  );
};

export default CategoryPage;
