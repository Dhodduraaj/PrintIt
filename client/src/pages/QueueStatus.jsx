import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import api from "../utils/api";

const QueueStatus = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const location = useLocation();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  const handleRetryPayment = async (jobToRetry) => {
    if (!jobToRetry) return;

    setProcessingPayment(true);
    try {
      // Create Razorpay order
      const orderResponse = await api.post("/api/payment/create-order", {
        amount: jobToRetry.amount,
        jobId: jobToRetry._id,
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
                jobId: jobToRetry._id,
              },
            );

            if (verifyResponse.data.success) {
              toast.success("Payment successful! 🎉");
              // Refresh job status
              fetchAllJobs();
            }
          } catch (err) {
            toast.error("Payment verification failed");
            console.error(err);
          } finally {
            setProcessingPayment(false);
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
            setProcessingPayment(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      toast.error("Failed to initiate payment");
      console.error(err);
      setProcessingPayment(false);
    }
  };

  useEffect(() => {
    fetchAllJobs();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("queueUpdate", () => {
      fetchAllJobs();
    });

    socket.on("jobStatusUpdate", () => {
      fetchAllJobs();
    });

    socket.on("paymentVerified", () => {
      fetchAllJobs();
      toast.success("Payment verified! You're in the queue now! 🎉");
    });

    return () => {
      socket.off("queueUpdate");
      socket.off("jobStatusUpdate");
      socket.off("paymentVerified");
    };
  }, [socket]);

  const fetchAllJobs = async () => {
    try {
      const response = await api.get("/api/student/requests/all");
      const liveJobs = response.data.liveRequests || [];
      setJobs(liveJobs);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      if (err.response?.status !== 401) {
        toast.error("Failed to fetch job details");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      waiting: "badge-waiting",
      printing: "badge-printing",
      done: "badge-done",
      pending: "badge-pending",
    };
    return badges[status] || "badge-waiting";
  };

  const getStatusText = (status) => {
    const texts = {
      waiting: "Waiting in Queue",
      printing: "Currently Printing",
      done: "Ready for Pickup",
      pending: "Payment Pending",
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-purple-900 font-semibold">Loading...</div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-purple-900 mb-4">
            No Active Jobs
          </h2>
          <p className="text-gray-600 mb-6">
            You don't have any active print jobs.
          </p>
          <button
            onClick={() => navigate("/student/dashboard")}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg"
          >
            Upload Document
          </button>
        </div>
      </div>
    );
  }

  // Group jobs by UPI reference ID (same payment transaction)
  const groupedJobs = jobs.reduce((groups, job) => {
    const key = job.upiReferenceId || job._id;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(job);
    return groups;
  }, {});

  const jobGroups = Object.values(groupedJobs).sort((a, b) => {
    const aTime = new Date(a[0].createdAt).getTime();
    const bTime = new Date(b[0].createdAt).getTime();
    return bTime - aTime; // Most recent first
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">My Queue</h1>
          <p className="text-gray-600">Track your print jobs in real-time</p>
        </div>

        <div className="space-y-6">
          {jobGroups.map((group) => {
            const isMultiFile = group.length > 1;
            const firstJob = group[0];
            const allPending = group.every(
              (j) => j.status === "pending" && !j.paymentVerified,
            );

            return (
              <div
                key={firstJob.upiReferenceId || firstJob._id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
              >
                {/* Group Header for Batch Requests */}
                {isMultiFile && (
                  <div className="mb-4 pb-3 border-b border-purple-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📦</span>
                        <div>
                          <h3 className="text-lg font-bold text-purple-900">
                            Batch Upload - {group.length} Files
                          </h3>
                          <p className="text-sm text-gray-600">
                            Uploaded together
                          </p>
                        </div>
                      </div>
                      {firstJob.upiReferenceId && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Payment ID:</p>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {firstJob.upiReferenceId.substring(0, 16)}...
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Pending Alert for Batch */}
                {allPending && (
                  <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">⚠️</span>
                      <div className="flex-1">
                        <h4 className="font-bold text-orange-900 mb-1">
                          Payment Required
                        </h4>
                        <p className="text-sm text-orange-800 mb-3">
                          Complete payment to add {group.length} file
                          {group.length > 1 ? "s" : ""} to the print queue
                        </p>
                        <button
                          onClick={() => handleRetryPayment(firstJob)}
                          disabled={processingPayment}
                          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
                        >
                          {processingPayment
                            ? "Processing..."
                            : "Complete Payment"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Individual Jobs */}
                <div className="space-y-3">
                  {group.map((job, index) => (
                    <div
                      key={job._id}
                      className={`${isMultiFile ? "bg-purple-50 rounded-lg p-4 border border-purple-200" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            {isMultiFile && (
                              <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded">
                                #{index + 1}
                              </span>
                            )}
                            <h3 className="text-xl font-bold text-purple-900">
                              Token #{job.tokenNumber}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                job.status === "waiting"
                                  ? "bg-purple-100 text-purple-700"
                                  : job.status === "printing"
                                    ? "bg-blue-100 text-blue-700"
                                    : job.status === "done"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {getStatusText(job.status)}
                            </span>
                          </div>

                          <div className="grid md:grid-cols-2 gap-2 text-sm">
                            <p>
                              <strong className="text-gray-700">
                                Document:
                              </strong>{" "}
                              <span className="text-gray-900">
                                {job.fileName}
                              </span>
                            </p>
                            <p>
                              <strong className="text-gray-700">
                                Page Range:
                              </strong>{" "}
                              <span className="text-gray-900">
                                {job.pageRange || "All"}
                              </span>
                            </p>
                            <p>
                              <strong className="text-gray-700">Pages:</strong>{" "}
                              <span className="text-gray-900">
                                {job.pageCount} × {job.copies}
                              </span>
                            </p>
                            <p>
                              <strong className="text-gray-700">Vendor:</strong>{" "}
                              <span className="text-purple-600 font-semibold">
                                {job.vendor?.name || "N/A"}
                              </span>
                            </p>
                            <p>
                              <strong className="text-gray-700">Type:</strong>{" "}
                              <span className="text-gray-900">
                                {job.printType === "color" ? "Color" : "B&W"}
                              </span>
                            </p>
                            <p>
                              <strong className="text-gray-700">Amount:</strong>{" "}
                              <span className="font-bold text-green-600">
                                ₹{job.amount}
                              </span>
                            </p>
                            {job.paymentVerified && (
                              <p>
                                <strong className="text-gray-700">
                                  Status:
                                </strong>{" "}
                                <span className="text-green-600 font-semibold">
                                  ✓ Paid
                                </span>
                              </p>
                            )}
                          </div>

                          {job.status === "done" && (
                            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                              <p className="text-sm font-semibold text-green-900">
                                ✅ Ready for pickup at vendor counter
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="px-8 py-3 bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold rounded-lg transition-all"
          >
            Upload Another Document
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueueStatus;
