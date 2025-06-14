import { type FC, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../../core/services/api';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

const RegisterPage: FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'jobSeeker',
    companyName: '',
    companyLogoUrl: '',
    companyDescription: '',
    companyWebsite: '',
    companyIndustry: '',
    companyLocation: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Check for error query parameter (e.g., from failed social login)
  useEffect(() => {
    const errorMessage = searchParams.get('error');
    if (errorMessage) {
      setError(decodeURIComponent(errorMessage));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data: any = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
      };

      if (formData.role === 'jobSeeker') {
        data.name = formData.name;
      } else if (formData.role === 'recruiter') {
        data.company = {
          name: formData.companyName,
          logoUrl: formData.companyLogoUrl || undefined,
          description: formData.companyDescription || undefined,
          website: formData.companyWebsite || undefined,
          industry: formData.companyIndustry || undefined,
          location: formData.companyLocation || undefined,
        };
      }

      const response = await api.register(data);
      navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await api.googleSignIn();
    } catch (err: any) {
      setError('Failed to initiate Google Sign-In');
    }
  };

  const handleLinkedInSignIn = async () => {
    try {
      await api.linkedInSignIn();
    } catch (err: any) {
      setError('Failed to initiate LinkedIn Sign-In');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onRegisterClick={() => navigate('/register')} />
      <main className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md border">
          <div>
            <h2 className="text-center text-2xl font-bold text-gray-900">Register</h2>
            {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
          </div>
          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              className="w-full py-3 rounded-lg font-medium transition-colors bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.545,10.239v3.621h5.739c-0.231,1.239-0.923,2.316-1.955,3.293c-1.277,1.239-3.093,2.008-5.329,2.008 c-3.293,0-6.078-2.239-7.062-5.524c-0.277-0.923-0.416-1.893-0.416-2.893s0.139-1.97,0.416-2.893 c0.985-3.285,3.77-5.524,7.062-5.524c1.616,0,3.078,0.585,4.216,1.539l2.908-2.908C16.523,1.923,14.339,1,12,1 C6.477,1,2,5.477,2,11s4.477,10,10,10c2.662,0,5.047-1.008,6.862-2.662c1.985-1.816,3.138-4.431,3.138-7.338 c0-0.693-0.062-1.385-0.185-2.062H12.545z"
                />
              </svg>
              Sign up with Google
            </button>
            <button
              onClick={handleLinkedInSignIn}
              className="w-full py-3 rounded-lg font-medium transition-colors bg-blue-700 hover:bg-blue-800 text-white flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"
                />
              </svg>
              Sign up with LinkedIn
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="border-t border-gray-300 w-full"></span>
            <span className="px-3 text-gray-500">or</span>
            <span className="border-t border-gray-300 w-full"></span>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="block w-full px-3 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="jobSeeker">Job Seeker</option>
                <option value="recruiter">Recruiter</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {formData.role === 'jobSeeker' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                />
              </div>
            )}
            {formData.role === 'recruiter' && (
              <>
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="block w-full px-3 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your company name"
                  />
                </div>
                <div>
                  <label htmlFor="companyLogoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Logo URL (optional)
                  </label>
                  <input
                    id="companyLogoUrl"
                    name="companyLogoUrl"
                    type="text"
                    value={formData.companyLogoUrl}
                    onChange={handleChange}
                    className="block w-full px-3 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter company logo URL"
                  />
                </div>
                <div>
                  <label htmlFor="companyDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Description (optional)
                  </label>
                  <input
                    id="companyDescription"
                    name="companyDescription"
                    type="text"
                    value={formData.companyDescription}
                    onChange={handleChange}
                    className="block w-full px-3 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter company description"
                  />
                </div>
                <div>
                  <label htmlFor="companyWebsite" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Website (optional)
                  </label>
                  <input
                    id="companyWebsite"
                    name="companyWebsite"
                    type="text"
                    value={formData.companyWebsite}
                    onChange={handleChange}
                    className="block w-full px-3 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter company website"
                  />
                </div>
                <div>
                  <label htmlFor="companyIndustry" className="block text-sm font-medium text-gray-700 mb-1">
                    Industry (optional)
                  </label>
                  <input
                    id="companyIndustry"
                    name="companyIndustry"
                    type="text"
                    value={formData.companyIndustry}
                    onChange={handleChange}
                    className="block w-full px-3 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter company industry"
                  />
                </div>
                <div>
                  <label htmlFor="companyLocation" className="block text-sm font-medium text-gray-700 mb-1">
                    Location (optional)
                  </label>
                  <input
                    id="companyLocation"
                    name="companyLocation"
                    type="text"
                    value={formData.companyLocation}
                    onChange={handleChange}
                    className="block w-full px-3 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter company location"
                  />
                </div>
              </>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-3 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone (optional)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="block w-full px-3 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="block w-full px-3 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                isLoading ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline">
              Login
            </button>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterPage;