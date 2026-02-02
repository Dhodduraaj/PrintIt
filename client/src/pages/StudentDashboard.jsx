import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import api from "../utils/api";
import pcServiceDesktop from "../assets/pcservice1.png";
import pcServiceMobile from "../assets/pcservice2.png";

const StudentDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    file: null,
    fileName: "",
    pageCount: "",
    printType: "black-white",
    copies: 1,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [serviceOpen, setServiceOpen] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.get("/api/student/service-status");
        setServiceOpen(response.data.isOpen);
      } catch (err) {
        console.error("Error fetching service status:", err);
      } finally {
        setStatusLoading(false);
      }
    };

    fetchStatus();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleStatusChange = ({ isOpen }) => {
      setServiceOpen(isOpen);
    };

    socket.on("serviceStatusChanged", handleStatusChange);

    return () => {
      socket.off("serviceStatusChanged", handleStatusChange);
    };
  }, [socket]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (
        file.type !== "application/pdf" &&
        !file.name.endsWith(".doc") &&
        !file.name.endsWith(".docx")
      ) {
        setError("Please upload PDF or DOC files only");
        toast.error("Please upload PDF or DOC files only");
        return;
      }
      setFormData({ ...formData, file, fileName: file.name });
      setError("");
      toast.success("File selected successfully.");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("dragover");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (file) {
      if (
        file.type !== "application/pdf" &&
        !file.name.endsWith(".doc") &&
        !file.name.endsWith(".docx")
      ) {
        setError("Please upload PDF or DOC files only");
        toast.error("Please upload PDF or DOC files only");
        return;
      }
      setFormData({ ...formData, file, fileName: file.name });
      setError("");
      toast.success("File ready to upload.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      setError("Please select a file");
      toast.error("Please select a file");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", formData.file);
      uploadFormData.append("pageCount", formData.pageCount);
      uploadFormData.append("printType", formData.printType);
      uploadFormData.append("copies", formData.copies);

      const response = await api.post("/api/student/upload", uploadFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Document uploaded successfully! 🎉");
      navigate("/student/queue", { state: { jobId: response.data.jobId } });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Upload failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  if (statusLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-xl text-purple-900 font-semibold">Loading...</div>
      </div>
    );
  }

  if (!serviceOpen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="w-full max-w-[1400px] mx-auto px-6 flex justify-center">
          <img
            src={pcServiceDesktop}
            alt="Service not available"
            className="hidden md:block w-full max-w-3xl rounded-xl shadow-lg"
          />
          <img
            src={pcServiceMobile}
            alt="Service not available"
            className="block md:hidden w-full max-w-sm rounded-xl shadow-lg"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-6">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Header */}
        <div className="mb-6">
          <div>
            <h1 className="text-3xl font-bold text-purple-900">
              Hey {user?.name}! 👋
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Quick upload • Fast queue • Easy pickup
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Upload Card */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📤</span>
                <h2 className="text-xl font-bold text-purple-900">
                  Upload & Print
                </h2>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Compact File Upload */}
                <div
                  className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50/50 transition-all mb-4 relative group"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.fileName ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <span className="text-xl">📄</span>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-800 text-sm">
                            {formData.fileName}
                          </p>
                          <p className="text-xs text-gray-500">
                            Ready to print
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({
                            ...formData,
                            file: null,
                            fileName: "",
                          });
                          toast.success("File removed.");
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-2 transition-colors"
                      >
                        <span className="text-lg">✕</span>
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-2">📁</div>
                      <p className="font-semibold text-gray-700 text-sm mb-1">
                        Drop file or click to browse
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, DOCX • Max 10MB
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </div>

                {/* Print Options - Compact Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Pages
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.pageCount}
                      onChange={(e) =>
                        setFormData({ ...formData, pageCount: e.target.value })
                      }
                      required
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Type
                    </label>
                    <select
                      value={formData.printType}
                      onChange={(e) =>
                        setFormData({ ...formData, printType: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    >
                      <option value="black-white">B&W</option>
                      <option value="color">Color</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Copies
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.copies}
                      onChange={(e) =>
                        setFormData({ ...formData, copies: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition-all shadow-md hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={uploading || !formData.file}
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> Uploading...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>🚀</span> Upload & Join Queue
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar - Tips & Info */}
          <div className="lg:col-span-4 space-y-4">
            {/* Pro Tip Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-md p-5 border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">💡</span>
                <h3 className="font-bold text-amber-900 text-sm">Pro Tip</h3>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Upload <strong>before break time</strong> to skip the rush!
                You'll get your prints faster.
              </p>
            </div>

            {/* How It Works */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md p-5 border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">📋</span>
                <h3 className="font-bold text-blue-900 text-sm">Quick Guide</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold text-xs">1.</span>
                  <p className="text-xs text-blue-800">Upload your document</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold text-xs">2.</span>
                  <p className="text-xs text-blue-800">Get queue position</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold text-xs">3.</span>
                  <p className="text-xs text-blue-800">Pay via UPI</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold text-xs">4.</span>
                  <p className="text-xs text-blue-800">Collect when ready!</p>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-md p-5 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">⚡</span>
                <h3 className="font-bold text-green-900 text-sm">
                  Why PrintFlow?
                </h3>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-800">No waiting</span>
                  <span className="text-xs font-bold text-green-700">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-800">
                    Real-time tracking
                  </span>
                  <span className="text-xs font-bold text-green-700">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-800">
                    Digital payment
                  </span>
                  <span className="text-xs font-bold text-green-700">✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
