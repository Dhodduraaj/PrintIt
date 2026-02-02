import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serviceOpen, setServiceOpen] = useState(true);
  const [isUpdatingService, setIsUpdatingService] = useState(false);
  const [studentServiceOpen, setStudentServiceOpen] = useState(true);

  useEffect(() => {
    const fetchVendorStatus = async () => {
      if (!user || user.role !== 'vendor') return;
      try {
        const res = await api.get('/api/vendor/service/status');
        setServiceOpen(res.data.isOpen);
      } catch (err) {
        console.error('Failed to fetch service status', err);
      }
    };

    fetchVendorStatus();
  }, [user]);

  useEffect(() => {
    const fetchStudentStatus = async () => {
      if (!user || user.role !== 'student') return;
      try {
        const res = await api.get('/api/student/service-status');
        setStudentServiceOpen(res.data.isOpen);
      } catch (err) {
        console.error('Failed to fetch student service status', err);
      }
    };

    fetchStudentStatus();
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully! See you soon! 👋');
    navigate('/');
  };

  const handleToggleService = async () => {
    if (!user || user.role !== 'vendor') return;

    setIsUpdatingService(true);
    try {
      const res = await api.post('/api/vendor/service/status', {
        isOpen: !serviceOpen,
      });
      setServiceOpen(res.data.isOpen);
      toast.success(
        res.data.isOpen
          ? 'Service opened. Students can now submit jobs.'
          : 'Service closed. Students will see service unavailable.'
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to update service status'
      );
    } finally {
      setIsUpdatingService(false);
    }
  };

  const getCurrentStudentPageLabel = () => {
    if (user?.role !== 'student') return '';
    const path = location.pathname;
    if (path.startsWith('/student/dashboard')) return 'Student Dashboard';
    if (path.startsWith('/student/queue')) return 'My Queue';
    if (path.startsWith('/student/requests')) return 'Requests';
    return '';
  };

  return (
    <nav className="bg-[#4F1C51] border-b border-[#2E1A4D] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Brand + Vendor Service Toggle */}
          <div className="flex items-center gap-4">
            {user?.role === 'vendor' && (
              <button
                onClick={handleToggleService}
                disabled={isUpdatingService}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all duration-200 ${
                  serviceOpen
                    ? 'border-red-400 text-red-200 hover:bg-red-500 hover:text-white'
                    : 'border-green-400 text-green-200 hover:bg-green-500 hover:text-white'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {serviceOpen ? 'Close service' : 'Open service'}
              </button>
            )}

            <Link
              to="/"
              className="text-xl font-semibold text-white tracking-wide flex items-center gap-2"
            >
              PrintFlow
            </Link>
          </div>

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
                {studentServiceOpen ? (
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

                    <Link
                      to="/student/requests"
                      className="text-gray-300 hover:text-white transition"
                    >
                      Requests
                    </Link>
                  </>
                ) : (
                  <span className="text-gray-300">
                    {getCurrentStudentPageLabel()}
                  </span>
                )}

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
