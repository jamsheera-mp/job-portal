import { type FC } from 'react';
import { Link } from 'react-router-dom';

const Header: FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">JobConnect</Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link to="/jobs" className="text-gray-700 hover:text-blue-600 font-medium">Browse Jobs</Link>
            <Link to="/companies" className="text-gray-700 hover:text-blue-600 font-medium">Companies</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">Login</Link>
            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Register
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;