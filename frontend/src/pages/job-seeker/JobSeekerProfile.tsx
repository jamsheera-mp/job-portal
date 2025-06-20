import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearUser } from '../../features/auth/slices/authSlice';
import { api } from '../../core/services/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const JobSeekerProfile: FC = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await api.logout();
      dispatch(clearUser());
      navigate('/login');
    } catch (err: any) {
      console.error('[JobSeekerProfile] Logout error:', err);
      setError(err.response?.data?.message || 'Logout failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onRegisterClick={() => navigate('/register')} />
      <section className="py-16 flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Job Seeker Profile</h2>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Logout
              </button>
            </div>
            {error && <p className="text-center text-sm text-red-600 mb-4">{error}</p>}
            <p className="text-gray-600">Welcome to your job seeker profile!</p>
            {/* Add profile details here (e.g., name, email, skills) */}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default JobSeekerProfile;