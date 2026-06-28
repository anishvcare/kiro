import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!user) return null;

  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';
  const initial = (user.first_name || user.email || 'U').charAt(0).toUpperCase();
  const roles = (user.roles || []).map((r) => r.replace(/_/g, ' ')).join(', ');

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login', { replace: true });
  };

  const Row = ({ label, value }) => (
    <div className="flex justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value || '-'}</span>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
          {initial}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{fullName}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
          {roles && (
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full capitalize">
              {roles}
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Account Details</h2>
        <Row label="Full Name" value={fullName} />
        <Row label="Email" value={user.email} />
        <Row label="Phone" value={user.phone} />
        <Row label="Role" value={<span className="capitalize">{roles}</span>} />
      </div>

      <button
        onClick={handleLogout}
        className="w-full py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default Profile;
