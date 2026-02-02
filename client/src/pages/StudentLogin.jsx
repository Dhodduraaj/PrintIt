import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import FloatingLines from "../components/FloatingLines";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/api";

// Regex patterns for validation
const REGEX_PATTERNS = {
  name: /^[a-zA-Z\s]{2,50}$/, // Letters and spaces, 2-50 chars
  studentId: /^[a-zA-Z0-9]{3,20}$/, // Alphanumeric, 3-20 chars
  email: /^[^\s@]+@kongu\.edu$/, // Must be @kongu.edu for students
  mobileNumber: /^\+91[0-9]{10}$/, // +91 followed by exactly 10 digits
  password: /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.{6,})/, // At least 1 letter, 1 number, 6+ chars
};

// Validation messages
const VALIDATION_MESSAGES = {
  name: "Name must be 2-50 characters (letters and spaces only)",
  studentId: "Student ID must be 3-20 characters (letters and numbers only)",
  email: "Must use your Kongu email address (@kongu.edu)",
  mobileNumber: "Mobile number must be +91 followed by 10 digits (e.g., +919876543210)",
  password: "Password must be at least 6 characters with letters and numbers",
};

const StudentLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isVendor, setIsVendor] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    mobileNumber: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    studentId: "",
    email: "",
    mobileNumber: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Validate individual field
  const validateField = (fieldName, value, isVendor = false) => {
    if (!isLogin && !isVendor) {
      // Signup validation
      switch (fieldName) {
        case "name":
          return !REGEX_PATTERNS.name.test(value) ? VALIDATION_MESSAGES.name : "";
        case "studentId":
          return !REGEX_PATTERNS.studentId.test(value) ? VALIDATION_MESSAGES.studentId : "";
        case "email":
          return !REGEX_PATTERNS.email.test(value) ? VALIDATION_MESSAGES.email : "";
        case "mobileNumber":
          // Remove spaces for validation
          const mobileNoSpaces = value.replace(/\s/g, "");
          return !REGEX_PATTERNS.mobileNumber.test(mobileNoSpaces) ? VALIDATION_MESSAGES.mobileNumber : "";
        case "password":
          return !REGEX_PATTERNS.password.test(value) ? VALIDATION_MESSAGES.password : "";
        default:
          return "";
      }
    }
    
    if (isLogin && !isVendor) {
      // Student login validation
      switch (fieldName) {
        case "email":
          return !REGEX_PATTERNS.email.test(value) ? VALIDATION_MESSAGES.email : "";
        case "password":
          return value.length < 6 ? "Password must be at least 6 characters" : "";
        default:
          return "";
      }
    }
    
    return "";
  };

  // Validate all fields for signup
  const validateAllFields = () => {
    const errors = {};
    
    if (!isVendor && !isLogin) {
      errors.name = validateField("name", formData.name);
      errors.studentId = validateField("studentId", formData.studentId);
      errors.email = validateField("email", formData.email);
      errors.mobileNumber = validateField("mobileNumber", formData.mobileNumber);
      errors.password = validateField("password", formData.password);
      
      return Object.values(errors).some(err => err !== "");
    }
    
    if (isLogin && !isVendor) {
      errors.email = validateField("email", formData.email);
      errors.password = validateField("password", formData.password);
      
      return Object.values(errors).some(err => err !== "");
    }
    
    return false;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
    
    // Real-time validation only during signup
    if (!isLogin && !isVendor) {
      const error = validateField(name, value, isVendor);
      setFieldErrors({ ...fieldErrors, [name]: error });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate all fields before submission
    if (validateAllFields()) {
      const errorMsg = "Please fix the validation errors above";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    // Additional validation for email domain for students
    if (!isVendor && !formData.email.toLowerCase().endsWith("@kongu.edu")) {
      const errorMsg = "Please use your Kongu email address (@kongu.edu)";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
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

      console.log("[Frontend] Endpoint:", endpoint);
      console.log("[Frontend] Payload:", formData);
      console.log("[Frontend] isLogin:", isLogin, "isVendor:", isVendor);

      const response = await api.post(endpoint, formData);

      login({ ...response.data.user, role }, response.data.token);
      toast.success(
        isLogin
          ? `Welcome back, ${response.data.user.name}!`
          : `Account created successfully! Welcome, ${response.data.user.name}!`
      );
      navigate(`/${role}/dashboard`);
    } catch (err) {
      console.error("[Frontend] Error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      const errorMessage = err.response?.data?.message || "An error occurred. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
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
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white backdrop-blur-sm text-gray-900 placeholder-gray-400 ${
                      fieldErrors.name ? "border-red-500" : "border-purple-300"
                    }`}
                  />
                  {fieldErrors.name && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
                  )}
                </div>
                {!isVendor && (
                  <div className="animate-fadeIn">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Student ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      required
                      placeholder="Enter your student ID"
                      className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white backdrop-blur-sm text-gray-900 placeholder-gray-400 ${
                        fieldErrors.studentId ? "border-red-500" : "border-purple-300"
                      }`}
                    />
                    {fieldErrors.studentId && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.studentId}</p>
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    required
                    placeholder="+91 9876543210"
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white backdrop-blur-sm text-gray-900 placeholder-gray-400 ${
                      fieldErrors.mobileNumber ? "border-red-500" : "border-purple-300"
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Include +91 country code (10 digits after +91)
                  </p>
                  {fieldErrors.mobileNumber && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.mobileNumber}</p>
                  )}
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder={isVendor ? "Enter your email" : "Enter your Kongu email (@kongu.edu)"}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white backdrop-blur-sm text-gray-900 placeholder-gray-400 ${
                  fieldErrors.email ? "border-red-500" : "border-purple-300"
                }`}
              />
              {!isVendor && (
                <p className="text-xs text-gray-500 mt-1">
                  Use your official Kongu email address
                </p>
              )}
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                minLength={6}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white backdrop-blur-sm text-gray-900 placeholder-gray-400 ${
                  fieldErrors.password ? "border-red-500" : "border-purple-300"
                }`}
              />
              {!isVendor && !isLogin && (
                <p className="text-xs text-gray-500 mt-1">
                  At least 6 characters with letters and numbers
                </p>
              )}
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
              )}
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
