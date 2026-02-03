import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import pcServiceDesktop from "../assets/pcservice1.png";
import pcServiceMobile from "../assets/pcservice2.png";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import api from "../utils/api";
import { countPdfPages, getPageRangeError } from "../utils/pdfUtils";

const StudentDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [serviceOpen, setServiceOpen] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    amount: 0,
    jobIds: [],
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

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];

    for (const file of files) {
      if (
        file.type !== "application/pdf" &&
        !file.name.endsWith(".doc") &&
        !file.name.endsWith(".docx")
      ) {
        toast.error(`${file.name}: Please upload PDF or DOC files only`);
        continue;
      }
      const totalPages = await countPdfPages(file);
      validFiles.push({
        id: Date.now() + Math.random(),
        file,
        fileName: file.name,
        pageRange: "",
        totalPages,
        printType: "black-white",
        copies: 1,
        duplex: "single-sided",
        paperSize: "A4",
        orientation: "portrait",
        pagesPerSheet: 1,
      });
    }

    if (validFiles.length > 0) {
      setFileList((prev) => [...prev, ...validFiles]);
      setError("");
      toast.success(`${validFiles.length} file(s) added successfully.`);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("dragover");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("dragover");
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("dragover");
    const files = Array.from(e.dataTransfer.files);
    const validFiles = [];

    for (const file of files) {
      if (
        file.type !== "application/pdf" &&
        !file.name.endsWith(".doc") &&
        !file.name.endsWith(".docx")
      ) {
        toast.error(`${file.name}: Please upload PDF or DOC files only`);
        continue;
      }
      const totalPages = await countPdfPages(file);
      validFiles.push({
        id: Date.now() + Math.random(),
        file,
        fileName: file.name,
        pageRange: "",
        totalPages,
        printType: "black-white",
        copies: 1,
        duplex: "single-sided",
        paperSize: "A4",
        orientation: "portrait",
        pagesPerSheet: 1,
      });
    }

    if (validFiles.length > 0) {
      setFileList((prev) => [...prev, ...validFiles]);
      setError("");
      toast.success(`${validFiles.length} file(s) ready to upload.`);
    }
  };

  const updateFileSettings = (id, field, value) => {
    setFileList((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
    );
  };

  const removeFile = (id) => {
    setFileList((prev) => prev.filter((f) => f.id !== id));
    toast.success("File removed.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fileList.length === 0) {
      setError("Please add at least one file");
      toast.error("Please add at least one file");
      return;
    }

    // Validate all files have page ranges and valid ranges
    for (const fileData of fileList) {
      if (!fileData.pageRange || !fileData.pageRange.trim()) {
        setError(`Please enter page range for ${fileData.fileName}`);
        toast.error(`Please enter page range for ${fileData.fileName}`);
        return;
      }

      const rangeError = getPageRangeError(
        fileData.pageRange,
        fileData.totalPages,
      );
      if (rangeError) {
        setError(`${fileData.fileName}: ${rangeError}`);
        toast.error(`${fileData.fileName}: ${rangeError}`);
        return;
      }

      const pageCount = calculatePageCount(fileData.pageRange);
      if (pageCount === 0) {
        setError(`Invalid page range for ${fileData.fileName}`);
        toast.error(`Invalid page range for ${fileData.fileName}`);
        return;
      }
    }

    setUploading(true);
    setError("");

    try {
      const uploadFormData = new FormData();

      // Add all files to the form data
      fileList.forEach((fileData, index) => {
        uploadFormData.append("file", fileData.file, fileData.fileName);
      });

      // We don't add common parameters since we're using individual file parameters

      // Add individual file parameters
      const fileParams = fileList.map((fileData) => ({
        pageCount: calculatePageCount(fileData.pageRange),
        pageRange: fileData.pageRange,
        printType: fileData.printType,
        copies: fileData.copies,
        duplex: fileData.duplex,
        paperSize: fileData.paperSize,
        orientation: fileData.orientation,
        pagesPerSheet: fileData.pagesPerSheet,
      }));

      uploadFormData.append("fileParams", JSON.stringify(fileParams));

      const response = await api.post("/api/student/upload", uploadFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Extract job IDs from response
      const uploadedJobs = response.data.jobs.map((job) => job.jobId);

      setPaymentDetails({
        amount: response.data.totalAmount,
        jobIds: uploadedJobs,
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
      // Create Razorpay order for all jobs combined
      const orderResponse = await api.post("/api/payment/create-order", {
        amount: paymentDetails.amount,
        jobId: paymentDetails.jobIds[0], // Use first job ID for order creation
        jobIds: paymentDetails.jobIds, // Send all job IDs
      });

      const { orderId, amount, currency, keyId } = orderResponse.data;

      // Razorpay checkout options
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "PrintFlow",
        description: `Print Job Payment (${paymentDetails.jobIds.length} file${paymentDetails.jobIds.length > 1 ? "s" : ""})`,
        order_id: orderId,
        handler: async function (response) {
          try {
            // Verify payment for all jobs
            const verifyResponse = await api.post(
              "/api/payment/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                jobId: paymentDetails.jobIds[0],
                jobIds: paymentDetails.jobIds, // Verify all jobs
              },
            );

            if (verifyResponse.data.success) {
              toast.success(
                `Payment successful! ${paymentDetails.jobIds.length} document(s) uploaded! 🎉`,
              );
              setShowPaymentModal(false);
              setFileList([]); // Clear file list
              navigate("/student/queue");
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
                  <div>
                    <div className="text-4xl mb-2">📁</div>
                    <p className="font-semibold text-gray-700 text-sm mb-1">
                      Drop files or click to browse
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX • Max 10MB each • Multiple files supported
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    multiple
                    style={{ display: "none" }}
                  />
                </div>

                {/* File List with Individual Settings */}
                {fileList.length > 0 && (
                  <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                    {fileList.map((fileData) => (
                      <div
                        key={fileData.id}
                        className="bg-purple-50 border border-purple-200 rounded-lg p-4"
                      >
                        {/* File Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-lg">📄</span>
                            <p className="font-semibold text-gray-800 text-sm truncate">
                              {fileData.fileName}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(fileData.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg p-1 transition-colors ml-2"
                          >
                            <span className="text-lg">✕</span>
                          </button>
                        </div>

                        {/* Print Settings Grid */}
                        <div className="space-y-2">
                          {/* Row 1 */}
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Page Range{" "}
                                <span className="text-red-500">*</span>
                                {fileData.totalPages != null && (
                                  <span className="text-gray-400 font-normal">
                                    (max {fileData.totalPages})
                                  </span>
                                )}
                              </label>
                              <input
                                type="text"
                                value={fileData.pageRange}
                                onChange={(e) =>
                                  updateFileSettings(
                                    fileData.id,
                                    "pageRange",
                                    e.target.value,
                                  )
                                }
                                placeholder="1-5 or 1,3,5"
                                className={`w-full px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs ${
                                  getPageRangeError(
                                    fileData.pageRange,
                                    fileData.totalPages,
                                  )
                                    ? "border-red-400"
                                    : "border-gray-300"
                                }`}
                              />
                              {getPageRangeError(
                                fileData.pageRange,
                                fileData.totalPages,
                              ) && (
                                <p className="text-red-500 text-xs mt-1">
                                  {getPageRangeError(
                                    fileData.pageRange,
                                    fileData.totalPages,
                                  )}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Print Type
                              </label>
                              <select
                                value={fileData.printType}
                                onChange={(e) =>
                                  updateFileSettings(
                                    fileData.id,
                                    "printType",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs"
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
                                value={fileData.copies}
                                onChange={(e) =>
                                  updateFileSettings(
                                    fileData.id,
                                    "copies",
                                    parseInt(e.target.value),
                                  )
                                }
                                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs"
                              />
                            </div>
                          </div>

                          {/* Row 2 */}
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Sides
                              </label>
                              <select
                                value={fileData.duplex}
                                onChange={(e) =>
                                  updateFileSettings(
                                    fileData.id,
                                    "duplex",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs"
                              >
                                <option value="single-sided">Single</option>
                                <option value="double-sided">Double</option>
                                <option value="double-sided-flip-long">
                                  Flip Long
                                </option>
                                <option value="double-sided-flip-short">
                                  Flip Short
                                </option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Paper Size
                              </label>
                              <select
                                value={fileData.paperSize}
                                onChange={(e) =>
                                  updateFileSettings(
                                    fileData.id,
                                    "paperSize",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs"
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
                                value={fileData.orientation}
                                onChange={(e) =>
                                  updateFileSettings(
                                    fileData.id,
                                    "orientation",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs"
                              >
                                <option value="portrait">Portrait</option>
                                <option value="landscape">Landscape</option>
                              </select>
                            </div>
                          </div>

                          {/* Row 3 */}
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Pages/Sheet
                              </label>
                              <select
                                value={fileData.pagesPerSheet}
                                onChange={(e) =>
                                  updateFileSettings(
                                    fileData.id,
                                    "pagesPerSheet",
                                    parseInt(e.target.value),
                                  )
                                }
                                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs"
                              >
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="4">4</option>
                                <option value="6">6</option>
                                <option value="9">9</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition-all shadow-md hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={uploading || fileList.length === 0}
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> Uploading{" "}
                      {fileList.length} file{fileList.length > 1 ? "s" : ""}...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>🚀</span> Upload{" "}
                      {fileList.length > 0
                        ? `${fileList.length} File${fileList.length > 1 ? "s" : ""}`
                        : "Files"}{" "}
                      & Join Queue
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
              <h3 className="font-semibold text-purple-900 mb-3 text-sm">
                Order Summary ({fileList.length} file
                {fileList.length > 1 ? "s" : ""})
              </h3>
              <div className="space-y-3">
                {fileList.map((fileData, index) => {
                  const pageCount = calculatePageCount(fileData.pageRange);
                  const pricePerPage = fileData.printType === "color" ? 5 : 2;
                  const amount = pageCount * pricePerPage * fileData.copies;

                  return (
                    <div
                      key={fileData.id}
                      className="bg-white rounded-lg p-3 border border-purple-200"
                    >
                      <p className="font-semibold text-gray-800 text-xs mb-2 truncate">
                        {index + 1}. {fileData.fileName}
                      </p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pages:</span>
                          <span className="font-medium text-gray-800">
                            {fileData.pageRange} ({pageCount} ×{" "}
                            {fileData.copies})
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium text-gray-800">
                            {fileData.printType === "color" ? "Color" : "B&W"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Settings:</span>
                          <span className="font-medium text-gray-800">
                            {fileData.paperSize},{" "}
                            {fileData.orientation === "portrait"
                              ? "Portrait"
                              : "Landscape"}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
                          <span className="text-gray-700 font-semibold">
                            Subtotal:
                          </span>
                          <span className="font-bold text-purple-600">
                            ₹{amount}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="border-t-2 border-purple-300 pt-3 mt-3">
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
