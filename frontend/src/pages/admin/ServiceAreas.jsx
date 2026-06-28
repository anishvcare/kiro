import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchServiceAreas } from '../../store/slices/adminSlice';
import api from '../../services/api';

const ServiceAreas = () => {
  const dispatch = useDispatch();
  const { serviceAreas } = useSelector((state) => state.admin);
  const [showForm, setShowForm] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [formData, setFormData] = useState({
    name: '', city: '', state: '', pincode: '',
    latitude: '', longitude: '', radius_km: 5, is_active: true,
  });

  useEffect(() => {
    dispatch(fetchServiceAreas({}));
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingArea) {
        await api.put(`/admin/service-areas/${editingArea.id}`, formData);
      } else {
        await api.post('/admin/service-areas', formData);
      }
      dispatch(fetchServiceAreas({}));
      resetForm();
    } catch (error) {
      console.error('Failed to save service area:', error);
    }
  };

  const handleEdit = (area) => {
    setEditingArea(area);
    setFormData({
      name: area.name,
      city: area.city,
      state: area.state || '',
      pincode: area.pincode || '',
      latitude: area.latitude || '',
      longitude: area.longitude || '',
      radius_km: area.radius_km || 5,
      is_active: area.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service area?')) {
      try {
        await api.delete(`/admin/service-areas/${id}`);
        dispatch(fetchServiceAreas({}));
      } catch (error) {
        console.error('Failed to delete service area:', error);
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingArea(null);
    setFormData({ name: '', city: '', state: '', pincode: '', latitude: '', longitude: '', radius_km: 5, is_active: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Service Areas</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
        >
          Add Area
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingArea ? 'Edit Service Area' : 'New Service Area'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City *</label>
                  <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pincode</label>
                  <input type="text" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Latitude</label>
                  <input type="number" step="any" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Longitude</label>
                  <input type="number" step="any" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Radius (km)</label>
                  <input type="number" value={formData.radius_km} onChange={(e) => setFormData({ ...formData, radius_km: parseInt(e.target.value) })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center">
                    <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">{editingArea ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {serviceAreas.data.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">No service areas configured</div>
        ) : (
          serviceAreas.data.map((area) => (
            <div key={area.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{area.name}</h3>
                  <p className="text-sm text-gray-500">{area.city}{area.state ? `, ${area.state}` : ''}</p>
                  {area.pincode && <p className="text-xs text-gray-400">PIN: {area.pincode}</p>}
                  <p className="text-xs text-gray-400 mt-1">Radius: {area.radius_km} km</p>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  area.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {area.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-3 flex space-x-3">
                <button onClick={() => handleEdit(area)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Edit</button>
                <button onClick={() => handleDelete(area.id)} className="text-xs text-red-600 hover:text-red-800 font-medium">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ServiceAreas;
