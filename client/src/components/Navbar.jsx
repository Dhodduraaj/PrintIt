import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2">
            🖨️ PrintFlow
          </Link>
          <div className="flex items-center gap-6">
            {!user ? (
              <>
                <Link to="/student/login" className="text-white hover:text-purple-200 font-medium transition-colors">
                  Student Login
                </Link>
                <Link to="/vendor/login" className="text-white hover:text-purple-200 font-medium transition-colors">
                  Vendor Login
                </Link>
              </>
            ) : user.role === 'student' ? (
              <>
                <Link to="/student/dashboard" className="text-white hover:text-purple-200 font-medium transition-colors">
                  Dashboard
                </Link>
                <Link to="/student/queue" className="text-white hover:text-purple-200 font-medium transition-colors">
                  My Queue
                </Link>
                <span className="text-white font-medium">{user.name}</span>
                <button onClick={handleLogout} className="px-4 py-2 bg-white text-purple-700 rounded-lg font-medium hover:bg-purple-50 transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/vendor/dashboard" className="text-white hover:text-purple-200 font-medium transition-colors">
                  Dashboard
                </Link>
                <span className="text-white font-medium">{user.name}</span>
                <button onClick={handleLogout} className="px-4 py-2 bg-white text-purple-700 rounded-lg font-medium hover:bg-purple-50 transition-colors">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
