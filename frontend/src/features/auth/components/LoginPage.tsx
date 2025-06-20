import { type FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setUser } from '../slices/authSlice';
import { api } from '../../../core/services/api';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

const LoginPage: FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [controller, setController] = useState<AbortController | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };



const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!formData.email || !formData.password) {
    setError('Email and password are required');
    return;
  }
  const abortController = new AbortController();
  setController(abortController);
  try {
    const response = await api.login(formData, abortController.signal);
    console.log('[LoginPage] API response:', response);
    if (response.user && response.redirectUrl) {
      console.log('[LoginPage] Dispatching user and navigating:', { user: response.user, redirectUrl: response.redirectUrl });
      dispatch(setUser(response.user));
      navigate(response.redirectUrl);
    } else if (response.message === 'Email not verified, OTP sent' && response.userId) {
      console.log('[LoginPage] OTP required, setting userId:', response.userId);
      setUserId(response.userId);
      setError('');
    } else {
      console.log('[LoginPage] Unexpected response:', response);
      setError(response.message || 'Login failed');
    }
  } catch (err: any) {
    console.error('[LoginPage] Error:', {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
    });
    setError(err.response?.data?.message || 'Login failed');
  } finally {
    setController(null);
  }
};
  const handleVerifyOtp = async (otp: string) => {
    const abortController = new AbortController();
    setController(abortController);
    try {
      const response = await api.verifyOtp({ userId, otp }, abortController.signal);
      if (response.user && response.redirectUrl) {
        dispatch(setUser(response.user));
        navigate(response.redirectUrl);
      } else {
        setError(response.message || 'OTP verification failed');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        setError('OTP verification failed');
      }
    } finally {
      setController(null);
    }
  };

  useEffect(() => {
    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, [controller]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onRegisterClick={() => navigate('/register')} />
      <section className="py-16 flex-grow">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Login</h2>
            {error && <p className="text-center text-sm text-red-600 mb-4">{error}</p>}
            {!userId ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <Mail className="h-5 w-5" />
                    </span>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <Lock className="h-5 w-5" />
                    </span>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Login
                </button>
              </form>
            ) : (
              <VerifyOtpForm onVerify={handleVerifyOtp} />
            )}
            <p className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Register here
              </a>
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

const VerifyOtpForm: FC<{ onVerify: (otp: string) => Promise<void> }> = ({ onVerify }) => {
  const [otp, setOtp] = useState('');

  const handleSubmit = async () => {
    await onVerify(otp);
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
        <input
          id="otp"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="block w-full px-3 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter the OTP"
        />
      </div>
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
      >
        Verify OTP
      </button>
    </div>
  );
};

export default LoginPage;