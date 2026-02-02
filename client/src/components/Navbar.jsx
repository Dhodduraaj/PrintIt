import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully! See you soon! 👋');
    navigate('/');
  };

  return (
    <nav className="bg-[#4F1C51] border-b border-[#2E1A4D] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link
            to="/"
            className="text-xl font-semibold text-white tracking-wide flex items-center gap-2"
          >
            🖨️ PrintFlow
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-6 text-sm">
            {!user ? (
              <Link
                to="/student/login"
                className="text-gray-300 hover:text-white transition"
              >
                Login
              </Link>
            ) : user.role === 'student' ? (
              <>
                <Link
                  to="/student/dashboard"
                  className="text-gray-300 hover:text-white transition"
                >
                  Dashboard
                </Link>

                <Link
                  to="/student/queue"
                  className="text-gray-300 hover:text-white transition"
                >
                  My Queue
                </Link>

                <span className="text-gray-400 font-medium">
                  {user.name}
                </span>

                <button
                  onClick={handleLogout}
                  className="px-4 py-1.5 rounded-md border border-[#7C5CFF] text-[#CFC6FF]
                             hover:bg-[#7C5CFF] hover:text-white
                             transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/vendor/dashboard"
                  className="text-gray-300 hover:text-white transition"
                >
                  Dashboard
                </Link>

                <span className="text-gray-400 font-medium">
                  {user.name}
                </span>

                <button
                  onClick={handleLogout}
                  className="px-4 py-1.5 rounded-md border border-[#7C5CFF] text-[#CFC6FF]
                             hover:bg-[#7C5CFF] hover:text-white
                             transition-all duration-200"
                >
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
