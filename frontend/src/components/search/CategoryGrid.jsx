import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../../store/slices/searchSlice';

const defaultCategories = [
  { name: 'Grocery', icon: '🛒' },
  { name: 'Electronics', icon: '📱' },
  { name: 'Clothing & Fashion', icon: '👗' },
  { name: 'Pharmacy & Medical', icon: '💊' },
  { name: 'Food & Restaurant', icon: '🍕' },
  { name: 'Hardware & Tools', icon: '🔧' },
  { name: 'Stationery & Books', icon: '📚' },
  { name: 'Beauty & Cosmetics', icon: '💄' },
  { name: 'Home & Furniture', icon: '🏠' },
  { name: 'Sports & Fitness', icon: '⚽' },
  { name: 'Toys & Games', icon: '🎮' },
  { name: 'Jewellery & Accessories', icon: '💎' },
  { name: 'Pet Supplies', icon: '🐾' },
  { name: 'Bakery & Sweets', icon: '🎂' },
  { name: 'Flowers & Gifts', icon: '🌸' },
  { name: 'Auto Parts & Services', icon: '🚗' },
  { name: 'Mobile & Repair', icon: '🔌' },
  { name: 'General Store', icon: '🏪' },
];

const CategoryGrid = ({ onCategorySelect }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.search);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const displayCategories = categories.length > 0
    ? categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon || defaultCategories.find((d) => d.name === cat.name)?.icon || '🏪',
      }))
    : defaultCategories;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Browse Categories</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {displayCategories.map((category, index) => (
          <button
            key={category.id || index}
            onClick={() => onCategorySelect(category)}
            className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            <span className="text-2xl mb-1">{category.icon}</span>
            <span className="text-xs text-gray-700 text-center font-medium line-clamp-2">
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
