import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="logo">
          🖨️ PrintFlow
        </Link>
        <div className="nav-links">
          {!user ? (
            <>
              <Link to="/student/login">Student Login</Link>
              <Link to="/vendor/login">Vendor Login</Link>
            </>
          ) : user.role === 'student' ? (
            <>
              <Link to="/student/dashboard">Dashboard</Link>
              <Link to="/student/queue">My Queue</Link>
              <span className="user-name">{user.name}</span>
              <button onClick={handleLogout} className="btn btn-outline">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/vendor/dashboard">Dashboard</Link>
              <span className="user-name">{user.name}</span>
              <button onClick={handleLogout} className="btn btn-outline">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
