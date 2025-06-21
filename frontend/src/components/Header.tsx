import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@core/hooks/useAuth';

interface HeaderProps {
  onRegisterClick?: () => void;
}

const Header: FC<HeaderProps> = ({ onRegisterClick }) => {
  console.log('[Header] Loading useAuth hook');
  const { isAuthenticated } = useAuth();
  console.log('[Header] isAuthenticated:', isAuthenticated());

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: JobConnect Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl sm:text-2xl font-bold text-blue-600">
              JobConnect
            </Link>
          </div>

          {/* Center: Navigation - Hidden on mobile, shown on larger screens */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/jobs" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
             Jobs
            </Link>
            <Link to="/companies" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Companies
            </Link>
          </nav>

          {/* Right: Auth Links */}
          {!isAuthenticated() && (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm sm:text-base"
              >
                Login
              </Link>
              {onRegisterClick ? (
                <button
                  onClick={onRegisterClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  Register
                </button>
              ) : (
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  Register
                </Link>
              )}
            </div>
          )}

          {/* Mobile Navigation Menu - You can add a hamburger menu here if needed */}
          <div className="md:hidden">
            {/* Add mobile menu button here if you want navigation on mobile */}
          </div>
        </div>

        {/* Mobile Navigation - Hidden by default, can be toggled */}
        <div className="md:hidden border-t border-gray-200">
          <nav className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/jobs" 
              className="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Browse Jobs
            </Link>
            <Link 
              to="/companies" 
              className="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Companies
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;