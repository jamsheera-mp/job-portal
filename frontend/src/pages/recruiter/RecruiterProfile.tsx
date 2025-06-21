import React, { useState, useEffect } from 'react';
import { Building2, FileText, Calendar, Target, LogOut, User, MessageSquare } from 'lucide-react';
import Header from '@components/Header';
import  Footer from '@components/Footer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@core/hooks/useAuth';
import withAuthProtection from '@core/hoc/withAuthProtection';

const RecruiterProfile: React.FC = () => {
  const navigate = useNavigate();
  const { logout, profile, role, isAuthenticated, checkAuth } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const sidebarItems = [
    { id: 'profile', label: 'Company Profile', icon: Building2 },
    { id: 'posts', label: 'Active Job Posts', icon: FileText },
    { id: 'tracking', label: 'Applicant Tracking', icon: User },
    { id: 'scheduler', label: 'Interview Scheduler', icon: Calendar },
    { id: 'aptitude', label: 'Aptitude Test', icon: Target },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ];

  useEffect(() => {
    const verifyAuth = async () => {
      setLoading(true);
      if (!isAuthenticated() || role !== 'recruiter') {
        const isAuth = await checkAuth();
        if (!isAuth || role !== 'recruiter') {
          setError('Unauthorized access');
          await logout();
          navigate('/login');
          return;
        }
      }
      setLoading(false);
      console.log('[RecruiterProfile] Profile:', profile);
      console.log('[RecruiterProfile] Error:', error);
    };
    verifyAuth();
  }, [isAuthenticated, role, checkAuth, logout, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err: any) {
      setError('Logout failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex flex-1">
        <div className="w-72 bg-white shadow-sm border-r border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
              <div className="text-xs text-gray-500 mb-2">You can upload the company logo here</div>
              <div className="font-semibold text-gray-900">
                {profile ? (profile.companyName || 'Company Name') : 'Loading...'}
              </div>
            </div>
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium mt-6 hover:bg-blue-700 transition-colors">
              Post New Job
            </button>
          </div>
          <div className="p-4">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg mb-2 transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-left rounded-lg text-red-600 hover:bg-red-50 mt-4"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>

        <div className="flex-1">
          <div className="p-8">
            {error && <p className="text-center text-red-600 mb-4">{error}</p>}
            {loading ? (
              <p className="text-center">Loading...</p>
            ) : profile ? (
              <div className="text-center max-w-md mx-auto">
                <h1 className="text-3xl font-bold text-blue-600 mb-4">Welcome</h1>
                <p className="text-gray-600">
                  Welcome, {profile.companyName || 'Company'}! Complete your profile to get started.
                </p>
                <p>Email: {profile.email}</p>
                <p>Phone: {profile.phone || 'Not provided'}</p>
              </div>
            ) : (
              <p className="text-center">No profile data available.</p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default withAuthProtection('recruiter')(RecruiterProfile);