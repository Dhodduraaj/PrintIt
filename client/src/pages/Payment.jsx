import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/api";

const Payment = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const jobId = location.state?.jobId;

  const [job, setJob] = useState(null);
  const [upiRef, setUpiRef] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!jobId) {
      navigate("/student/dashboard");
      return;
    }
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const response = await api.get(`/api/student/job/${jobId}`);
      setJob(response.data.job);
    } catch (err) {
      setError("Failed to load job details");
    }
  };

  const calculateAmount = () => {
    if (!job) return 0;
    const pageRate = job.printType === "color" ? 5 : 2;
    return job.pageCount * pageRate * job.copies;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!upiRef.trim()) {
      setError("Please enter UPI reference ID");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await api.post(`/api/student/payment/${jobId}`, {
        upiReferenceId: upiRef.trim(),
      });

      if (response.data.success) {
        navigate("/student/queue", { state: { jobId } });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Payment verification failed. Please check your reference ID.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-purple-900 font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">
            💳 Payment Confirmation
          </h1>
          <p className="text-lg text-purple-700">
            Enter your UPI payment reference ID
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h3 className="text-2xl font-bold text-purple-900 mb-6">
            Order Summary
          </h3>
          <div className="space-y-4">
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
            <div className="flex justify-between py-4 bg-purple-50 px-4 rounded-lg">
              <span className="text-lg font-bold text-purple-900">
                Total Amount:
              </span>
              <span className="text-2xl font-bold text-purple-600">
                ₹{calculateAmount()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h3 className="text-2xl font-bold text-purple-900 mb-6">
            UPI Payment
          </h3>
          <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl p-8 text-center mb-6">
            <div className="text-6xl mb-4">📱</div>
            <p className="text-lg font-semibold text-purple-900 mb-2">
              Scan QR Code to Pay
            </p>
            <p className="text-purple-700 font-medium">
              UPI ID: vendor@printflow
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                UPI Reference ID
              </label>
              <input
                type="text"
                value={upiRef}
                onChange={(e) => {
                  setUpiRef(e.target.value);
                  setError("");
                }}
                placeholder="Enter UPI transaction reference ID"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <small className="text-gray-500 mt-2 block">
                Find this in your payment app after completing the transaction
              </small>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? "Verifying..." : "Confirm Payment"}
            </button>
          </form>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-xl shadow-lg p-6 mb-6">
          <h4 className="text-lg font-bold text-yellow-900 mb-3">
            ⚠️ Important Notes
          </h4>
          <ul className="space-y-2 text-yellow-900">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Each UPI reference ID can only be used once</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Payment verification may take a few moments</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>
                Keep your payment receipt until verification is complete
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>
                Contact vendor if payment is not verified within 5 minutes
              </span>
            </li>
          </ul>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => navigate("/student/queue", { state: { jobId } })}
            className="px-8 py-3 bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold rounded-lg transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
