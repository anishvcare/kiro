import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShopPublicProfile } from '../../services/shopService';

const ShopProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadShop = async () => {
      try {
        setLoading(true);
        const shopData = await getShopPublicProfile(id);
        setShop(shopData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load shop profile');
      } finally {
        setLoading(false);
      }
    };
    loadShop();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 h-48 rounded-lg" />
        <div className="animate-pulse bg-gray-200 h-6 w-1/3 rounded" />
        <div className="animate-pulse bg-gray-200 h-4 w-1/2 rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!shop) return null;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative">
        {shop.banner_url ? (
          <img
            src={shop.banner_url}
            alt={`${shop.name} banner`}
            className="w-full h-48 object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
        )}

        {/* Logo overlay */}
        <div className="absolute -bottom-8 left-6">
          {shop.logo_url ? (
            <img
              src={shop.logo_url}
              alt={shop.name}
              className="w-20 h-20 rounded-full border-4 border-white object-cover shadow"
            />
          ) : (
            <div className="w-20 h-20 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center shadow">
              <span className="text-indigo-600 font-bold text-2xl">
                {shop.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Shop Info */}
      <div className="pt-10 px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">{shop.name}</h1>
          {shop.is_verified && (
            <svg className="h-6 w-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {shop.category && (
          <p className="text-sm text-gray-500 mt-1">{shop.category.name}</p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-medium">{parseFloat(shop.rating || 0).toFixed(1)}</span>
          </div>
          <span className="text-sm text-gray-500">({shop.total_ratings || 0} ratings)</span>
        </div>

        {/* Description */}
        {shop.description && (
          <p className="text-gray-600 mt-3">{shop.description}</p>
        )}
      </div>

      {/* Details */}
      <div className="bg-white rounded-lg shadow p-4 space-y-3">
        <h2 className="font-semibold text-gray-900">Shop Details</h2>

        {shop.address && (
          <div className="flex items-start gap-2">
            <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm text-gray-600">{shop.address}{shop.city ? `, ${shop.city}` : ''}{shop.pincode ? ` - ${shop.pincode}` : ''}</span>
          </div>
        )}

        {shop.phone && (
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-sm text-gray-600">{shop.phone}</span>
          </div>
        )}

        {shop.opening_time && shop.closing_time && (
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-gray-600">{shop.opening_time} - {shop.closing_time}</span>
          </div>
        )}

        {shop.keywords && shop.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {shop.keywords.map((kw, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                {kw.keyword}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 px-4">
        <button
          onClick={() => navigate(`/customer/create-request/${id}`)}
          className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Send Request
        </button>
        <button
          onClick={() => navigate(`/customer/chat?shopId=${id}`)}
          className="flex-1 bg-white text-indigo-600 border border-indigo-600 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
        >
          Chat
        </button>
      </div>
    </div>
  );
};

export default ShopProfile;
