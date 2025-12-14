import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* App name/logo on left */}
          <Link to="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            Instagram Clone
          </Link>

          {/* Navigation links - hidden on mobile, visible on desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/create"
              className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
            >
              Create Post
            </Link>
            <Link
              to="/profile"
              className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button - visible on mobile, hidden on desktop */}
          <div className="md:hidden">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.username}</span>
              <button
                onClick={handleLogout}
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile navigation links */}
        <div className="md:hidden pb-4 space-y-2">
          <Link
            to="/"
            className="block text-gray-700 hover:text-indigo-600 transition-colors font-medium py-2"
          >
            Home
          </Link>
          <Link
            to="/create"
            className="block text-gray-700 hover:text-indigo-600 transition-colors font-medium py-2"
          >
            Create Post
          </Link>
          <Link
            to="/profile"
            className="block text-gray-700 hover:text-indigo-600 transition-colors font-medium py-2"
          >
            Profile
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

