import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Landing from "./pages/Landing";
import StudentLogin from "./pages/StudentLogin";
import VendorLogin from "./pages/VendorLogin";
import StudentDashboard from "./pages/StudentDashboard";
import QueueStatus from "./pages/QueueStatus";
import VendorDashboard from "./pages/VendorDashboard";
import Admin from "./pages/Admin";

function AppContent() {
  const location = useLocation();
  const hideNavbarRoutes = [
    "/student/login",
    "/student-login",
    "/vendor/login",
    "/vendor-login",
  ];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="app">
      {!shouldHideNavbar && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Landing />} />

          {/* Authentication Routes */}
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/vendor/login" element={<VendorLogin />} />
          <Route path="/vendor-login" element={<VendorLogin />} />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/queue"
            element={
              <ProtectedRoute requiredRole="student">
                <QueueStatus />
              </ProtectedRoute>
            }
          />

          {/* Vendor Routes */}
          <Route
            path="/vendor/dashboard"
            element={
              <ProtectedRoute requiredRole="vendor">
                <VendorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <AppContent />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
