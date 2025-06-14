import { type FC, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building, User, Mail, Phone, Lock } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setUser } from '../slices/authSlice';
import { api } from '../../../core/services/api';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

type Role = 'jobSeeker' | 'recruiter';

const RegisterPage: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  const [role, setRole] = useState<Role>(roleParam === 'recruiter' ? 'recruiter' : 'jobSeeker');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: role,
    companyName: role === 'recruiter' ? '' : undefined,
  });
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: '',
    companyName: '',
  });
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [controller, setController] = useState<AbortController | null>(null);

  const validateForm = () => {
    const newErrors = {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      role: '',
      companyName: '',
    };
    let isValid = true;

    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
      isValid = false;
    } else if (!/^[A-Za-z\s]{2,}$/.test(formData.fullName)) {
      newErrors.fullName = 'Full name must be at least 2 characters and contain only letters and spaces';
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters and include letters, numbers, and special characters';
      isValid = false;
    }

    if (!role) {
      newErrors.role = 'Role is required';
      isValid = false;
    }

    if (role === 'recruiter' && !formData.companyName) {
      newErrors.companyName = 'Company name is required for recruiters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    setErrors({ fullName: '', email: '', phone: '', password: '', role: '', companyName: '' });
    setSuccess('');
    const abortController = new AbortController();
    setController(abortController);
    try {
      const data = {
        email: formData.email,
        password: formData.password,
        role,
        name: formData.fullName,
        phone: formData.phone,
        ...(role === 'recruiter' && { company: { name: formData.companyName } }),
      };
      console.log('Register Request Payload:', data);
      const response = await api.register(data, abortController.signal);
      console.log('Register Response:', response);
      if (response.message === 'User registered, OTP sent to email') {
        console.log('Registration successful, setting success message and redirecting...');
        setSuccess('Registration successful! Redirecting to OTP verification...');
        setTimeout(() => {
          console.log('Navigating to /verify-otp with email:', formData.email);
          navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
        }, 1500);
      } else {
        console.log('Unexpected response message:', response.message);
        setErrors({
          fullName: '',
          email: response.message || 'Registration failed',
          phone: '',
          password: '',
          role: '',
          companyName: '',
        });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        console.error('Register Error:', err);
        console.error('Error Response:', err.response?.data);
        setErrors({
          fullName: '',
          email: err.response?.data?.message || err.message || 'Registration failed',
          phone: '',
          password: '',
          role: '',
          companyName: '',
        });
      }
    } finally {
      setLoading(false);
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Register as {role === 'recruiter' ? 'a Recruiter' : 'a Job Seeker'}
            </h2>
            <div className="flex justify-center mb-6">
              <button
                onClick={() => {
                  setRole('jobSeeker');
                  navigate('/register?role=jobSeeker');
                }}
                className={`px-4 py-2 rounded-l-lg font-medium ${role === 'jobSeeker' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Job Seeker
              </button>
              <button
                onClick={() => {
                  setRole('recruiter');
                  navigate('/register?role=recruiter');
                }}
                className={`px-4 py-2 rounded-r-lg font-medium ${role === 'recruiter' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Recruiter
              </button>
            </div>
            {success && (
              <p className="text-center text-sm text-green-600 mb-4">{success}</p>
            )}
            {Object.values(errors).some((err) => err) && (
              <div className="text-center text-sm text-red-600 mb-4">
                {Object.values(errors).find((err) => err) || 'Please fix the errors below'}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <User className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>
                )}
              </div>
              {role === 'recruiter' && (
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <Building className="h-5 w-5" />
                    </span>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={formData.companyName || ''}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your company name"
                    />
                  </div>
                  {errors.companyName && (
                    <p className="text-sm text-red-600 mt-1">{errors.companyName}</p>
                  )}
                </div>
              )}
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
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Phone className="h-5 w-5" />
                  </span>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your phone number"
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                )}
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
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  loading
                    ? 'bg-blue-300 text-white cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Login here
              </a>
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default RegisterPage;