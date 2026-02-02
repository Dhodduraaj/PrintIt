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
  const jobId = location.state?.jobId;

  const [job, setJob] = useState(null);
  const [queuePosition, setQueuePosition] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  const handleRetryPayment = async () => {
    if (!job) return;

    setProcessingPayment(true);
    try {
      // Create Razorpay order
      const orderResponse = await api.post("/api/payment/create-order", {
        amount: job.amount,
        jobId: job._id,
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
                jobId: job._id,
              },
            );

            if (verifyResponse.data.success) {
              toast.success("Payment successful! 🎉");
              // Refresh job status
              fetchJobStatus();
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
    if (!jobId) {
      fetchLatestJob();
    } else {
      fetchJobStatus();
    }
  }, [jobId]);

  useEffect(() => {
    if (!socket) return;

    socket.on("queueUpdate", (data) => {
      if (data.jobId === job?._id) {
        setJob(data.job);
        setQueuePosition(data.queuePosition);
        if (data.queuePosition <= 3 && data.queuePosition > 0) {
          toast.success(
            `You're #${data.queuePosition} in queue! Almost there! 🚀`,
          );
        }
      }
    });

    socket.on("jobStatusUpdate", (data) => {
      if (data.jobId === job?._id) {
        setJob((prev) => ({ ...prev, status: data.status }));

        if (data.status === "printing") {
          toast.info("Your document is being printed! 🖨️");
        } else if (data.status === "done") {
          toast.success("Your print is ready for pickup! ✅");
        }
      }
    });

    socket.on("paymentVerified", (data) => {
      if (data._id === job?._id) {
        setJob(data);
        toast.success("Payment verified! You're in the queue now! 🎉");
        fetchJobStatus();
      }
    });

    return () => {
      socket.off("queueUpdate");
      socket.off("jobStatusUpdate");
      socket.off("paymentVerified");
    };
  }, [socket, job]);

  const fetchLatestJob = async () => {
    try {
      const response = await api.get("/api/student/latest-job");
      if (response.data.job) {
        setJob(response.data.job);
        setQueuePosition(response.data.queuePosition);
      } else {
        toast("No active jobs found.", { icon: "ℹ️" });
      }
    } catch (err) {
      console.error("Error fetching job:", err);
      if (err.response?.status !== 401) {
        toast.error("Failed to fetch job details");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchJobStatus = async () => {
    try {
      const response = await api.get(`/api/student/job/${jobId}`);
      setJob(response.data.job);
      setQueuePosition(response.data.queuePosition);
    } catch (err) {
      console.error("Error fetching job:", err);
      if (err.response?.status !== 401) {
        toast.error("Failed to fetch job status");
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

  if (!job) {
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

  // Render for Payment Pending status
  if (job.status === "pending" && !job.paymentVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">⏳</span>
              </div>
              <h2 className="text-3xl font-bold text-orange-600 mb-2">
                Payment Pending
              </h2>
              <p className="text-gray-600">
                Your document has been uploaded but payment is not yet completed
              </p>
            </div>

            {/* Job Details */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Document Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Token Number:</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {job.tokenNumber}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Document:</span>
                  <span className="text-gray-900 font-semibold">
                    {job.fileName}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Pages:</span>
                  <span className="text-gray-900 font-semibold">
                    {job.pageCount} × {job.copies} copies
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Type:</span>
                  <span className="text-gray-900 font-semibold">
                    {job.printType === "color" ? "Color" : "Black & White"}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 font-medium">Amount:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{job.amount}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Status Alert */}
            <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h4 className="text-lg font-bold text-orange-900 mb-2">
                    Action Required
                  </h4>
                  <p className="text-orange-800 mb-3">
                    You need to complete the payment to join the print queue.
                    Your document will not be printed until payment is verified.
                  </p>
                  <p className="text-sm text-orange-700">
                    Payment Status:{" "}
                    <span className="font-bold">Not Verified</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/student/dashboard")}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all"
              >
                Cancel & Upload New
              </button>
              <button
                onClick={handleRetryPayment}
                disabled={processingPayment}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingPayment ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span> Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>💳</span> Complete Payment
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Token Number Card */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-2xl p-8 mb-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Your Token Number
          </h2>
          <div className="text-7xl font-bold text-white mb-4">
            {job.tokenNumber || "---"}
          </div>
          <div className="flex items-center justify-center gap-3">
            <span
              className={`w-4 h-4 rounded-full animate-pulse ${
                job.status === "waiting"
                  ? "bg-yellow-300"
                  : job.status === "printing"
                    ? "bg-blue-300"
                    : job.status === "done"
                      ? "bg-green-300"
                      : "bg-orange-300"
              }`}
            ></span>
            <span className="text-xl font-semibold text-white">
              {getStatusText(job.status)}
            </span>
          </div>
        </div>

        {/* Payment Status Badge */}
        {job.paymentVerified && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-xl shadow-md p-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h4 className="font-bold text-green-900">Payment Verified</h4>
                <p className="text-sm text-green-700">
                  Amount: ₹{job.amount} | Transaction ID:{" "}
                  {job.upiReferenceId?.substring(0, 12)}...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Queue Information */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h3 className="text-2xl font-bold text-purple-900 mb-6">
            Queue Information
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-700 font-medium">
                Position in Queue:
              </span>
              <span className="text-lg font-bold text-purple-600">
                {queuePosition > 0 ? `#${queuePosition}` : "Processing..."}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-700 font-medium">Document:</span>
              <span className="text-gray-900 font-semibold">
                {job.fileName}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-700 font-medium">Pages:</span>
              <span className="text-gray-900 font-semibold">
                {job.pageCount}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-700 font-medium">Type:</span>
              <span className="text-gray-900 font-semibold">
                {job.printType === "color" ? "Color" : "Black & White"}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-700 font-medium">Copies:</span>
              <span className="text-gray-900 font-semibold">{job.copies}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-700 font-medium">Amount Paid:</span>
              <span className="text-gray-900 font-bold text-green-600">
                ₹{job.amount}
              </span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-700 font-medium">Status:</span>
              <span
                className={`px-4 py-1 rounded-full text-sm font-semibold ${
                  job.status === "waiting"
                    ? "bg-purple-100 text-purple-700"
                    : job.status === "printing"
                      ? "bg-blue-100 text-blue-700"
                      : job.status === "done"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {getStatusText(job.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Done Status */}
        {job.status === "done" && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-green-900 mb-3">
              ✅ Print Ready!
            </h3>
            <p className="text-green-900 mb-2">
              Your document has been printed and is ready for pickup.
            </p>
            <p className="text-green-800 font-medium">
              Please collect your print from the vendor counter.
            </p>
          </div>
        )}

        <div className="flex justify-center">
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
