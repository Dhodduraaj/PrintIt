import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/api";
import FloatingLines from "../components/FloatingLines";

const StudentLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isVendor, setIsVendor] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let endpoint;
      let role;

      if (isVendor) {
        endpoint = isLogin
          ? "/api/auth/vendor/login"
          : "/api/auth/vendor/register";
        role = "vendor";
      } else {
        endpoint = isLogin
          ? "/api/auth/student/login"
          : "/api/auth/student/register";
        role = "student";
      }

      const response = await api.post(endpoint, formData);

      login({ ...response.data.user, role }, response.data.token);
      navigate(`/${role}/dashboard`);
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <FloatingLines
          linesGradient={["#4B157A", "#7A2FBF", "#9B4DFF", "#C38BFF"]}
          enabledWaves={["top", "middle", "bottom"]}
          lineCount={[10, 8, 12]}
          lineDistance={[3, 2.5, 4]}
          topWavePosition={{ x: 10.0, y: 0.5, rotate: -0.4 }}
          middleWavePosition={{ x: 5.0, y: 0.0, rotate: 0.2 }}
          bottomWavePosition={{ x: 2.0, y: -0.7, rotate: -0.3 }}
          animationSpeed={0.6}
          interactive={true}
          bendRadius={5.0}
          bendStrength={-0.5}
          mouseDamping={0.05}
          parallax={true}
          parallaxStrength={0.15}
          mixBlendMode="multiply"
        />
      </div>

      {/* Centered Form Panel */}
      <div className="w-full max-w-md mx-auto p-4 relative z-10">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-purple-200">
          {/* User Type Switcher */}
          <div className="flex items-center justify-center gap-1.5 mb-6 bg-purple-100 backdrop-blur-sm rounded-xl p-1">
            <button
              onClick={() => setIsVendor(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
                !isVendor
                  ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg"
                  : "text-gray-600 hover:text-purple-700"
              }`}
            >
              <span className="text-lg mr-1.5">👨‍🎓</span>
              Student
            </button>
            <button
              onClick={() => setIsVendor(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
                isVendor
                  ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg"
                  : "text-gray-600 hover:text-purple-700"
              }`}
            >
              <span className="text-lg mr-1.5">🏪</span>
              Vendor
            </button>
          </div>

          <div className="text-center mb-6 transition-all duration-300">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent mb-1 transition-all duration-300">
              {isVendor ? "Vendor Portal" : "Student Portal"}
            </h1>
            <p className="text-gray-600 text-sm transition-all duration-300">
              {isLogin ? "Login to your account" : "Create a new account"}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 backdrop-blur-sm border border-red-300 text-red-700 px-3 py-2 rounded-lg mb-4 shadow-sm text-sm animate-fadeIn">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2.5 text-sm border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white backdrop-blur-sm text-gray-900 placeholder-gray-400"
                  />
                </div>
                {!isVendor && (
                  <div className="animate-fadeIn">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Student ID
                    </label>
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      required
                      placeholder="Enter your student ID"
                      className="w-full px-3 py-2.5 text-sm border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white backdrop-blur-sm text-gray-900 placeholder-gray-400"
                    />
                  </div>
                )}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className="w-full px-3 py-2.5 text-sm border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white backdrop-blur-sm text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                minLength={6}
                className="w-full px-3 py-2.5 text-sm border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white backdrop-blur-sm text-gray-900 placeholder-gray-400"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={loading}
            >
              {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
            </button>
          </form>

          <div className="text-center mt-4 text-gray-600 text-sm">
            {isLogin ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLogin(false);
                  }}
                  className="text-purple-700 hover:text-purple-900 font-semibold transition-colors"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLogin(true);
                  }}
                  className="text-purple-700 hover:text-purple-900 font-semibold transition-colors"
                >
                  Login
                </button>
              </>
            )}
          </div>

          <div className="text-center mt-4">
            <Link
              to="/"
              className="text-purple-700 hover:text-purple-900 font-medium transition-colors inline-flex items-center gap-1.5 text-sm"
            >
              <span>←</span>
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
