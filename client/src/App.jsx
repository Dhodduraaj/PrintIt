import { Toaster } from "react-hot-toast";
import {
    Route,
    BrowserRouter as Router,
    Routes,
    useLocation,
} from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";

// Pages
import Admin from "./pages/Admin";
import Landing from "./pages/Landing";
import QueueStatus from "./pages/QueueStatus";
import StudentDashboard from "./pages/StudentDashboard";
import StudentLogin from "./pages/StudentLogin";
import UserRequestDashboard from "./pages/UserRequestDashboard";
import VendorDashboard from "./pages/VendorDashboard";
import VendorLogin from "./pages/VendorLogin";

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
    <div className="app min-h-screen flex flex-col">
      {!shouldHideNavbar && <Navbar />}
      <main className="main-content flex-1">
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
          <Route
            path="/student/requests"
            element={
              <ProtectedRoute requiredRole="student">
                <UserRequestDashboard />
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
      {!shouldHideNavbar && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 1000,
              style: {
                background: "#7A2FBF",
                color: "#fff",
                fontWeight: "500",
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 10px 25px rgba(122, 47, 191, 0.3)",
              },
              success: {
                duration: 1000,
                style: {
                  background:
                    "linear-gradient(135deg, #7A2FBF 0%, #9B4DFF 100%)",
                },
                iconTheme: {
                  primary: "#fff",
                  secondary: "#7A2FBF",
                },
              },
              error: {
                duration: 1200,
                style: {
                  background:
                    "linear-gradient(135deg, #991b1b 0%, #dc2626 100%)",
                },
                iconTheme: {
                  primary: "#fff",
                  secondary: "#991b1b",
                },
              },
              loading: {
                style: {
                  background:
                    "linear-gradient(135deg, #4B157A 0%, #7A2FBF 100%)",
                },
                iconTheme: {
                  primary: "#fff",
                  secondary: "#4B157A",
                },
              },
            }}
          />
          <AppContent />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
