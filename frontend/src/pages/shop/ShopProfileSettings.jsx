import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMyShops,
  fetchShopProfile,
  updateShopProfile,
  updateBusinessHours,
  updatePaymentDetails,
} from '../../store/slices/shopSlice';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const ShopProfileSettings = () => {
  const dispatch = useDispatch();
  const { myShops, currentShop, isLoading } = useSelector((state) => state.shop);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    name: '', description: '', address: '', city: '', pincode: '',
    phone: '', whatsapp: '', email: '', keywords: '',
  });
  const [hoursForm, setHoursForm] = useState({
    opening_time: '09:00', closing_time: '21:00', working_days: [],
  });
  const [paymentForm, setPaymentForm] = useState({
    upi_id: '', upi_phone: '', bharatpe_id: '',
  });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    dispatch(fetchMyShops());
  }, [dispatch]);

  useEffect(() => {
    if (myShops.length > 0 && !currentShop) {
      dispatch(fetchShopProfile(myShops[0].id));
    }
  }, [dispatch, myShops, currentShop]);

  useEffect(() => {
    if (currentShop) {
      setProfileForm({
        name: currentShop.name || '',
        description: currentShop.description || '',
        address: currentShop.address || '',
        city: currentShop.city || '',
        pincode: currentShop.pincode || '',
        phone: currentShop.phone || '',
        whatsapp: currentShop.whatsapp || '',
        email: currentShop.email || '',
        keywords: currentShop.keywords?.map((k) => k.keyword).join(', ') || '',
      });
      setHoursForm({
        opening_time: currentShop.opening_time || '09:00',
        closing_time: currentShop.closing_time || '21:00',
        working_days: currentShop.working_days || [],
      });
      const account = currentShop.paymentAccounts?.[0]?.account_details || {};
      setPaymentForm({
        upi_id: account.upi_id || '',
        upi_phone: account.upi_phone || '',
        bharatpe_id: account.bharatpe_id || '',
      });
    }
  }, [currentShop]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...profileForm,
      keywords: profileForm.keywords ? profileForm.keywords.split(',').map((k) => k.trim()).filter(Boolean) : [],
    };
    dispatch(updateShopProfile({ shopId: currentShop.id, data }));
    showSuccess('Profile updated successfully');
  };

  const handleHoursSubmit = (e) => {
    e.preventDefault();
    dispatch(updateBusinessHours({ shopId: currentShop.id, data: hoursForm }));
    showSuccess('Business hours updated successfully');
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    dispatch(updatePaymentDetails({ shopId: currentShop.id, data: paymentForm }));
    showSuccess('Payment details updated successfully');
  };

  const handleDayToggle = (day) => {
    setHoursForm((prev) => ({
      ...prev,
      working_days: prev.working_days.includes(day)
        ? prev.working_days.filter((d) => d !== day)
        : [...prev.working_days, day],
    }));
  };

  if (!currentShop && isLoading) {
    return <div className="animate-pulse bg-gray-200 rounded-lg h-96" />;
  }

  if (!currentShop) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No shop found. Please register a shop first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Shop Settings</h1>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700">{successMsg}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { key: 'profile', label: 'Profile' },
            { key: 'hours', label: 'Business Hours' },
            { key: 'payment', label: 'Payment' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <input
                type="tel"
                value={profileForm.whatsapp}
                onChange={(e) => setProfileForm((p) => ({ ...p, whatsapp: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={profileForm.description}
              onChange={(e) => setProfileForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={profileForm.address}
              onChange={(e) => setProfileForm((p) => ({ ...p, address: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={profileForm.city}
                onChange={(e) => setProfileForm((p) => ({ ...p, city: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <input
                type="text"
                value={profileForm.pincode}
                onChange={(e) => setProfileForm((p) => ({ ...p, pincode: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (comma-separated)</label>
            <input
              type="text"
              value={profileForm.keywords}
              onChange={(e) => setProfileForm((p) => ({ ...p, keywords: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
          >
            {isLoading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      )}

      {/* Business Hours Tab */}
      {activeTab === 'hours' && (
        <form onSubmit={handleHoursSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
              <input
                type="time"
                value={hoursForm.opening_time}
                onChange={(e) => setHoursForm((p) => ({ ...p, opening_time: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
              <input
                type="time"
                value={hoursForm.closing_time}
                onChange={(e) => setHoursForm((p) => ({ ...p, closing_time: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${
                    hoursForm.working_days.includes(day)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
          >
            {isLoading ? 'Saving...' : 'Save Hours'}
          </button>
        </form>
      )}

      {/* Payment Tab */}
      {activeTab === 'payment' && (
        <form onSubmit={handlePaymentSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
            <input
              type="text"
              value={paymentForm.upi_id}
              onChange={(e) => setPaymentForm((p) => ({ ...p, upi_id: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="yourshop@upi"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">UPI Phone Number</label>
            <input
              type="tel"
              value={paymentForm.upi_phone}
              onChange={(e) => setPaymentForm((p) => ({ ...p, upi_phone: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="+91 XXXXX XXXXX"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">BharatPe ID</label>
            <input
              type="text"
              value={paymentForm.bharatpe_id}
              onChange={(e) => setPaymentForm((p) => ({ ...p, bharatpe_id: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="BharatPe merchant ID"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
          >
            {isLoading ? 'Saving...' : 'Save Payment Details'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ShopProfileSettings;
