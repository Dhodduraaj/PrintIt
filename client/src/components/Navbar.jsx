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
    <nav className="bg-gradient-to-r from-[#7A2FBF] to-[#4B157A] shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-gray-300 flex items-center gap-2">
            🖨️ PrintFlow
          </Link>
          <div className="flex items-center gap-6">
            {!user ? (
              <>
                <Link to="/student/login" className="text-gray-300 hover:text-gray-100 font-medium transition-colors">
                  Student Login
                </Link>
                <Link to="/vendor/login" className="text-gray-300 hover:text-gray-100 font-medium transition-colors">
                  Vendor Login
                </Link>
              </>
            ) : user.role === 'student' ? (
              <>
                <Link to="/student/dashboard" className="text-gray-300 hover:text-gray-100 font-medium transition-colors">
                  Dashboard
                </Link>
                <Link to="/student/queue" className="text-gray-300 hover:text-gray-100 font-medium transition-colors">
                  My Queue
                </Link>
                <span className="text-gray-300 font-medium">{user.name}</span>
                <button onClick={handleLogout} className="px-4 py-2 bg-[#7A2FBF] text-white rounded-lg font-medium hover:bg-[#9B4DFF] transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/vendor/dashboard" className="text-gray-300 hover:text-gray-100 font-medium transition-colors">
                  Dashboard
                </Link>
                <span className="text-gray-300 font-medium">{user.name}</span>
                <button onClick={handleLogout} className="px-4 py-2 bg-[#7A2FBF] text-white rounded-lg font-medium hover:bg-[#9B4DFF] transition-colors">
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