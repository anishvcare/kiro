import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login, verifyOtp, clearError } from '../../store/slices/authSlice';
import authService from '../../services/authService';
import { getRoleHome } from '../../utils/roleRedirect';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

  // 'phone' (default, for customers) or 'email' (staff/business)
  const [mode, setMode] = useState('phone');

  // Phone OTP state
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [localError, setLocalError] = useState('');
  const [info, setInfo] = useState('');
  const [sending, setSending] = useState(false);

  // Email login state
  const [formData, setFormData] = useState({ email: '', password: '' });

  useEffect(() => {
    if (isAuthenticated) {
      const target = location.state?.from?.pathname || getRoleHome(user);
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.state]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const displayPhone = (raw) => {
    const t = raw.trim().replace(/[\s-]/g, '');
    if (t.startsWith('+')) return t;
    const digits = t.replace(/[^0-9]/g, '');
    return digits.length === 10 ? `+91${digits}` : `+${digits}`;
  };

  // ----- Phone OTP handlers -----
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLocalError('');
    setInfo('');
    const digits = phone.replace(/[^0-9]/g, '');
    if (digits.length < 10) {
      setLocalError('Please enter a valid phone number.');
      return;
    }
    setSending(true);
    try {
      const res = await authService.requestOtp({ phone });
      setOtpSent(true);
      // If the server is in debug/test mode it returns the code to ease testing.
      if (res?.data?.debug_otp) {
        setOtp(res.data.debug_otp);
        setInfo('Test mode: the code has been auto-filled below. Tap Verify to continue.');
      } else {
        setInfo(`We sent a code on WhatsApp to ${displayPhone(phone)}.`);
      }
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to send the code. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setLocalError('');
    if (!otp || otp.length < 6) {
      setLocalError('Enter the 6-digit code sent to your WhatsApp.');
      return;
    }
    dispatch(verifyOtp({ phone, otp, first_name: firstName || undefined }));
  };

  const handleResend = async () => {
    setLocalError('');
    setInfo('');
    try {
      await authService.requestOtp({ phone });
      setInfo('A new code has been sent on WhatsApp.');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Could not resend the code yet.');
    }
  };

  const handleChangePhone = () => {
    setOtpSent(false);
    setOtp('');
    setInfo('');
    setLocalError('');
  };

  // ----- Email login handlers -----
  const handleEmailChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  const shownError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link to="/" className="block text-center text-2xl font-bold text-indigo-600">LocalShop</Link>
          <h2 className="mt-4 text-center text-2xl font-extrabold text-gray-900">
            {mode === 'phone' ? 'Continue with WhatsApp' : 'Business / Staff login'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {mode === 'phone'
              ? 'We will send a one-time code to your WhatsApp number.'
              : 'Shop owners, delivery agents and admins sign in here.'}
          </p>
        </div>

        {shownError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" role="alert">
            <span className="block sm:inline">{shownError}</span>
          </div>
        )}
        {info && !shownError && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
            {info}
          </div>
        )}

        {/* PHONE / WHATSAPP OTP MODE */}
        {mode === 'phone' && (
          <div className="mt-6 space-y-6">
            {!otpSent ? (
              <form className="space-y-4" onSubmit={handleSendOtp}>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    WhatsApp number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-400">Indian numbers get +91 automatically. For others, include the country code (e.g. +1...).</p>
                </div>
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    Your name <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full flex justify-center py-2.5 px-4 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
                >
                  {sending ? 'Sending code...' : 'Send code on WhatsApp'}
                </button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleVerifyOtp}>
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                    Enter the 6-digit code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md tracking-widest text-center text-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="------"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Sent to {displayPhone(phone)}.{' '}
                    <button type="button" onClick={handleChangePhone} className="text-indigo-600 font-medium">
                      Change number
                    </button>
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2.5 px-4 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Continue'}
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Resend code
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => { setMode('email'); setLocalError(''); setInfo(''); dispatch(clearError()); }}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
            >
              Business / Staff login &rarr;
            </button>
          </div>
        )}

        {/* EMAIL/PASSWORD MODE */}
        {mode === 'email' && (
          <form className="mt-6 space-y-6" onSubmit={handleEmailSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleEmailChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleEmailChange}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>

            <button
              type="button"
              onClick={() => { setMode('phone'); setLocalError(''); setInfo(''); dispatch(clearError()); }}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
            >
              &larr; Continue with WhatsApp instead
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
