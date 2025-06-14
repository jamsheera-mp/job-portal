import { type FC, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../slices/authSlice';
import { api } from '../../../core/services/api';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

const VerifyOtpPage: FC = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [controller, setController] = useState<AbortController | null>(null);

  useEffect(() => {
    if (!email) {
      setError('Email is missing. Please register again.');
      setTimeout(() => {
        navigate('/register');
      }, 3000);
    }
  }, [email, navigate]);

  const handleVerifyOtp = async () => {
    if (!email) {
      setError('Email is missing. Please register again.');
      return;
    }
    const abortController = new AbortController();
    setController(abortController);
    try {
      const response = await api.verifyOtp({ email, otp }, abortController.signal);
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
        setError(err.response?.data?.message || 'OTP verification failed');
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
      <main className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md border">
          <div>
            <h2 className="text-center text-2xl font-bold text-gray-900">Verify OTP</h2>
            {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
          </div>
          <div className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                Enter OTP
              </label>
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
              onClick={handleVerifyOtp}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
              disabled={!email}
            >
              Verify OTP
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyOtpPage;