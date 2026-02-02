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
    pageRange: "",
    printType: "black-white",
    copies: 1,
    duplex: "single-sided",
    paperSize: "A4",
    orientation: "portrait",
    pagesPerSheet: 1,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [serviceOpen, setServiceOpen] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    amount: 0,
    jobId: null,
  });

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

  const calculatePageCount = (pageRange) => {
    // Parse page ranges like "1-5,7,9-12" and return total count
    if (!pageRange || !pageRange.trim()) return 0;

    try {
      const ranges = pageRange.split(",");
      let totalPages = 0;

      for (let range of ranges) {
        range = range.trim();
        if (range.includes("-")) {
          const [start, end] = range.split("-").map((n) => parseInt(n.trim()));
          if (isNaN(start) || isNaN(end) || start > end || start < 1) {
            throw new Error("Invalid range");
          }
          totalPages += end - start + 1;
        } else {
          const page = parseInt(range);
          if (isNaN(page) || page < 1) {
            throw new Error("Invalid page number");
          }
          totalPages += 1;
        }
      }
      return totalPages;
    } catch (err) {
      return 0;
    }
  };

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

    if (!formData.pageRange || !formData.pageRange.trim()) {
      setError("Please enter page range");
      toast.error("Please enter page range (e.g., 1-5 or 1,3,5)");
      return;
    }

    const pageCount = calculatePageCount(formData.pageRange);
    if (pageCount === 0) {
      setError("Invalid page range format");
      toast.error("Invalid page range. Use format like: 1-5 or 1,3,5-10");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // First upload the file
      const uploadFormData = new FormData();
      uploadFormData.append("file", formData.file);
      uploadFormData.append("pageCount", pageCount);
      uploadFormData.append("pageRange", formData.pageRange);
      uploadFormData.append("printType", formData.printType);
      uploadFormData.append("copies", formData.copies);
      uploadFormData.append("duplex", formData.duplex);
      uploadFormData.append("paperSize", formData.paperSize);
      uploadFormData.append("orientation", formData.orientation);
      uploadFormData.append("pagesPerSheet", formData.pagesPerSheet);

      const response = await api.post("/api/student/upload", uploadFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Calculate amount and show payment modal
      const pricePerPage = formData.printType === "color" ? 5 : 2;
      const totalAmount = pageCount * pricePerPage * formData.copies;

      setPaymentDetails({
        amount: totalAmount,
        jobId: response.data.jobId,
      });
      setShowPaymentModal(true);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Upload failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handlePaymentSubmit = async () => {
    try {
      // Create Razorpay order
      const orderResponse = await api.post("/api/payment/create-order", {
        amount: paymentDetails.amount,
        jobId: paymentDetails.jobId,
      });

      const { orderId, amount, currency, keyId } = orderResponse.data;

      // Razorpay checkout options
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "PrintFlow",
        description: "Print Job Payment",
        order_id: orderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await api.post(
              "/api/payment/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                jobId: paymentDetails.jobId,
              },
            );

            if (verifyResponse.data.success) {
              toast.success("Payment successful! Document uploaded! 🎉");
              setShowPaymentModal(false);
              navigate("/student/queue", {
                state: { jobId: paymentDetails.jobId },
              });
            }
          } catch (err) {
            toast.error("Payment verification failed");
            console.error(err);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#7A2FBF",
        },
        modal: {
          ondismiss: function () {
            toast.error("Payment cancelled");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      toast.error("Failed to initiate payment");
      console.error(err);
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
                <div className="space-y-3 mb-4">
                  {/* Row 1: Page Range, Print Type, Copies */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Page Range <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.pageRange}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pageRange: e.target.value,
                          })
                        }
                        required
                        placeholder="1-5 or 1,3,5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Print Type
                      </label>
                      <select
                        value={formData.printType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            printType: e.target.value,
                          })
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      >
                        <option value="black-white">Black & White</option>
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

                  {/* Row 2: Duplex, Paper Size, Orientation */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Sides
                      </label>
                      <select
                        value={formData.duplex}
                        onChange={(e) =>
                          setFormData({ ...formData, duplex: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      >
                        <option value="single-sided">Single Sided</option>
                        <option value="double-sided">Double Sided</option>
                        <option value="double-sided-flip-long">
                          Double (Flip Long)
                        </option>
                        <option value="double-sided-flip-short">
                          Double (Flip Short)
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Paper Size
                      </label>
                      <select
                        value={formData.paperSize}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paperSize: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      >
                        <option value="A4">A4</option>
                        <option value="A3">A3</option>
                        <option value="Letter">Letter</option>
                        <option value="Legal">Legal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Orientation
                      </label>
                      <select
                        value={formData.orientation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            orientation: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      >
                        <option value="portrait">Portrait</option>
                        <option value="landscape">Landscape</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Pages Per Sheet */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Pages Per Sheet
                      </label>
                      <select
                        value={formData.pagesPerSheet}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pagesPerSheet: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      >
                        <option value="1">1 Page</option>
                        <option value="2">2 Pages</option>
                        <option value="4">4 Pages</option>
                        <option value="6">6 Pages</option>
                        <option value="9">9 Pages</option>
                      </select>
                    </div>
                    <div className="col-span-2 flex items-end">
                      <div className="text-xs text-gray-500 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 w-full">
                        💡 <strong>Tip:</strong> Use page range like "1-5,7" for
                        specific pages
                      </div>
                    </div>
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
                  <p className="text-xs text-blue-800">
                    Upload & select page range
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold text-xs">2.</span>
                  <p className="text-xs text-blue-800">
                    Complete secure payment
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold text-xs">3.</span>
                  <p className="text-xs text-blue-800">Track in real-time</p>
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

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-indigo-900/20 to-purple-900/20 backdrop-blur-md flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => {
                setShowPaymentModal(false);
                toast.error("Payment cancelled. Job will be deleted.");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-2xl">✕</span>
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💳</span>
              </div>
              <h2 className="text-2xl font-bold text-purple-900 mb-2">
                Complete Payment
              </h2>
              <p className="text-gray-600 text-sm">
                Secure payment powered by Razorpay
              </p>
            </div>

            {/* Payment Summary */}
            <div className="bg-purple-50 rounded-lg p-4 mb-6 max-h-96 overflow-y-auto">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Page Range:</span>
                  <span className="font-semibold text-gray-800">
                    {formData.pageRange}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Pages:</span>
                  <span className="font-semibold text-gray-800">
                    {calculatePageCount(formData.pageRange)} × {formData.copies}{" "}
                    copies
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Print Type:</span>
                  <span className="font-semibold text-gray-800">
                    {formData.printType === "color" ? "Color" : "Black & White"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sides:</span>
                  <span className="font-semibold text-gray-800">
                    {formData.duplex === "single-sided"
                      ? "Single"
                      : formData.duplex === "double-sided"
                        ? "Double"
                        : formData.duplex === "double-sided-flip-long"
                          ? "Double (Flip Long)"
                          : "Double (Flip Short)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paper Size:</span>
                  <span className="font-semibold text-gray-800">
                    {formData.paperSize}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Orientation:</span>
                  <span className="font-semibold text-gray-800">
                    {formData.orientation.charAt(0).toUpperCase() +
                      formData.orientation.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pages Per Sheet:</span>
                  <span className="font-semibold text-gray-800">
                    {formData.pagesPerSheet}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rate:</span>
                  <span className="font-semibold text-gray-800">
                    ₹{formData.printType === "color" ? "5" : "2"}/page
                  </span>
                </div>
                <div className="border-t border-purple-200 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800">
                      Total Amount:
                    </span>
                    <span className="text-2xl font-bold text-purple-600">
                      ₹{paymentDetails.amount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Options Info */}
            <div className="mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="text-lg">✅</span> Accepted Payment Methods:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
                  <div className="flex items-center gap-1">
                    <span>💳</span> Credit/Debit Card
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📱</span> UPI
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🏦</span> Net Banking
                  </div>
                  <div className="flex items-center gap-1">
                    <span>💰</span> Wallets
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    toast.error("Payment cancelled");
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePaymentSubmit}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>🔒</span> Pay ₹{paymentDetails.amount}
                  </span>
                </button>
              </div>
            </div>

            {/* Security Badge */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <span>🔒</span>
                <span>Secured by Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
