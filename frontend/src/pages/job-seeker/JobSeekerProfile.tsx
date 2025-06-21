import React, { useState, useEffect } from 'react';
import { FileText, Target, Calendar, Settings, LogOut, Upload, MessageSquare } from 'lucide-react';
import  Header  from '@components/Header';
import  Footer  from '@components/Footer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@core/hooks/useAuth';
import withAuthProtection from '@core/hoc/withAuthProtection';

const JobSeekerProfile: React.FC = () => {
  const navigate = useNavigate();
  const { logout, profile, role, isAuthenticated, checkAuth } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const sidebarItems = [
    { id: 'applications', label: 'My Applications', icon: FileText },
    { id: 'saved', label: 'Saved Jobs', icon: Target },
    { id: 'resume', label: 'My Resume', icon: FileText },
    { id: 'interview', label: 'Interview Schedule', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ];

  useEffect(() => {
    const verifyAuth = async () => {
      setLoading(true);
      if (!isAuthenticated() || role !== 'jobSeeker') {
        const isAuth = await checkAuth();
        if (!isAuth || role !== 'jobSeeker') {
          setError('Unauthorized access');
          await logout();
          navigate('/login');
          return;
        }
      }
      setLoading(false);
      console.log('[JobSeekerProfile] Profile:', profile);
      console.log('[JobSeekerProfile] Error:', error);
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
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center border-2 border-dashed border-gray-300">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              <div className="text-xs text-gray-500 mb-2">Upload your profile picture</div>
              <div className="font-semibold text-gray-900">
                {profile ? profile.fullName : 'Loading...'}
              </div>
              <div className="text-sm text-gray-500">Complete your profile</div>
            </div>
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
                <p className="text-gray-600">Hello, {profile.fullName}! Complete your profile to get started.</p>
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

export default withAuthProtection('jobSeeker')(JobSeekerProfile);