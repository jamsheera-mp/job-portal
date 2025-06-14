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
  const [success, setSuccess] = useState('');
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [controller, setController] = useState<AbortController | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!email) {
      setError('Email is missing. Please register again.');
      setTimeout(() => {
        navigate('/register');
      }, 3000);
    }
  }, [email, navigate]);

  useEffect(() => {
   let timer: ReturnType<typeof setTimeout>;

    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerifyOtp = async () => {
    if (!email) {
      setError('Email is missing. Please register again.');
      return;
    }
    setIsVerifying(true);
    setError('');
    setSuccess('');
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
      setIsVerifying(false);
      setController(null);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError('Email is missing. Please register again.');
      return;
    }
    setIsResending(true);
    setError('');
    setSuccess('');
    const abortController = new AbortController();
    setController(abortController);
    try {
      const response = await api.resendOtp({ email }, abortController.signal);
      setSuccess(response.message || 'OTP resent successfully');
      setResendCooldown(30);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        setError(err.response?.data?.message || 'Failed to resend OTP');
      }
    } finally {
      setIsResending(false);
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
            {success && <p className="mt-2 text-center text-sm text-green-600">{success}</p>}
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
                disabled={isVerifying || isResending}
              />
            </div>
            <button
              onClick={handleVerifyOtp}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                isVerifying || !email
                  ? 'bg-blue-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              disabled={isVerifying || !email}
            >
              {isVerifying ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              onClick={handleResendOtp}
              disabled={!email || resendCooldown > 0 || isResending}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                resendCooldown > 0 || isResending
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {resendCooldown > 0
                ? `Resend OTP (${resendCooldown}s)`
                : isResending
                ? 'Resending...'
                : 'Resend OTP'}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyOtpPage;