import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import api from "../utils/api";

const UserRequestDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();

  const [liveRequests, setLiveRequests] = useState([]);
  const [historyRequests, setHistoryRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearingHistory, setClearingHistory] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  // Fetch all requests on mount
  useEffect(() => {
    fetchAllRequests();
  }, []);

  // Set up socket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleQueueUpdate = (data) => {
      setLiveRequests((prev) =>
        prev.map((req) =>
          req._id === data.jobId
            ? { ...req, queuePosition: data.queuePosition }
            : req
        )
      );
    };

    const handleJobStatusUpdate = (data) => {
      setLiveRequests((prev) => {
        // If status changed to "done", move to history
        if (data.status === "done") {
          const completedJob = prev.find((req) => req._id === data.jobId);
          if (completedJob) {
            setHistoryRequests((prevHistory) => [
              { ...completedJob, status: "done" },
              ...prevHistory,
            ]);
            toast.success("Your print is ready for pickup! ✅");
          }
        }

        // Update status and filter out non-live requests
        const updated = prev
          .map((req) =>
            req._id === data.jobId
              ? { ...req, status: data.status }
              : req
          )
          .filter((req) => ["pending", "waiting", "printing"].includes(req.status));

        return updated;
      });
    };

    socket.on("queueUpdate", handleQueueUpdate);
    socket.on("jobStatusUpdate", handleJobStatusUpdate);

    return () => {
      socket.off("queueUpdate", handleQueueUpdate);
      socket.off("jobStatusUpdate", handleJobStatusUpdate);
    };
  }, [socket]);

  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/student/requests/all");
      setLiveRequests(response.data.liveRequests);
      setHistoryRequests(response.data.historyRequests);
    } catch (err) {
      console.error("Error fetching requests:", err);
      if (err.response?.status !== 401) {
        toast.error("Failed to load requests");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      setClearingHistory(true);
      await api.delete("/api/student/requests/history", {
        data: { confirmed: true },
      });
      setHistoryRequests([]);
      setShowClearConfirmation(false);
      toast.success("Request history cleared");
    } catch (err) {
      console.error("Error clearing history:", err);
      toast.error("Failed to clear history");
    } finally {
      setClearingHistory(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-700";
      case "waiting":
        return "bg-yellow-100 text-yellow-700";
      case "printing":
        return "bg-blue-100 text-blue-700";
      case "done":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "waiting":
        return "📋";
      case "printing":
        return "🖨️";
      case "done":
        return "✅";
      default:
        return "📄";
    }
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "Payment Pending",
      waiting: "Waiting in Queue",
      printing: "Currently Printing",
      done: "Completed",
    };
    return texts[status] || status;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const RequestCard = ({ request, isLive }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">
            {request.fileName}
          </h4>
          <p className="text-sm text-gray-500 mt-1">
            Request ID: <span className="font-mono">{request._id.slice(-8)}</span>
          </p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(request.status)}`}>
          {getStatusIcon(request.status)} {getStatusText(request.status)}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Pages:</p>
            <p className="font-semibold text-gray-900">{request.pageCount}</p>
          </div>
          <div>
            <p className="text-gray-600">Type:</p>
            <p className="font-semibold text-gray-900">
              {request.printType === "color" ? "Color" : "B&W"}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Copies:</p>
            <p className="font-semibold text-gray-900">{request.copies}</p>
          </div>
          <div>
            <p className="text-gray-600">Amount:</p>
            <p className="font-semibold text-gray-900">₹{request.amount}</p>
          </div>
        </div>

        {isLive && request.queuePosition > 0 && (
          <div className="bg-purple-50 rounded p-3">
            <p className="text-sm text-purple-700 font-medium">
              🎯 Queue Position: <span className="text-xl font-bold">#{request.queuePosition}</span>
            </p>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1 pt-2 border-t border-gray-200">
          <p>📤 Submitted: {formatDate(request.createdAt)}</p>
          <p>🔄 Last Updated: {formatDate(request.updatedAt)}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-purple-900 font-semibold">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">
            📊 Request Dashboard
          </h1>
          <p className="text-gray-600">
            Track your print requests and view your request history
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <p className="text-gray-600 text-sm font-medium">Live Requests</p>
            <p className="text-4xl font-bold text-red-600">{liveRequests.length}</p>
            <p className="text-xs text-gray-500 mt-2">Pending, Waiting, or Printing</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-medium">Completed</p>
            <p className="text-4xl font-bold text-green-600">{historyRequests.length}</p>
            <p className="text-xs text-gray-500 mt-2">Ready for pickup</p>
          </div>
        </div>

        {/* Live Requests Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-purple-900">
                🚀 Live Requests
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Your active requests sorted by oldest first (FIFO queue)
              </p>
            </div>
          </div>

          {liveRequests.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <p className="text-2xl mb-2">🎉</p>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Active Requests
              </h3>
              <p className="text-gray-600">
                All your print requests are complete. You're all caught up!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {liveRequests.map((request) => (
                <RequestCard key={request._id} request={request} isLive={true} />
              ))}
            </div>
          )}
        </div>

        {/* Request History Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                📜 Request History
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Your completed requests (sorted by most recent first)
              </p>
            </div>
            {historyRequests.length > 0 && (
              <button
                onClick={() => setShowClearConfirmation(true)}
                className="px-4 py-2 bg-red-50 border border-red-300 text-red-600 hover:bg-red-100 font-semibold rounded-lg transition-all text-sm"
              >
                🗑️ Clear History
              </button>
            )}
          </div>

          {historyRequests.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <p className="text-2xl mb-2">📭</p>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No History
              </h3>
              <p className="text-gray-600">
                Your completed print requests will appear here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {historyRequests.map((request) => (
                <RequestCard key={request._id} request={request} isLive={false} />
              ))}
            </div>
          )}
        </div>

        {/* Clear History Confirmation Modal */}
        {showClearConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 animate-in">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                🗑️ Clear History?
              </h3>
              <p className="text-gray-600 mb-2">
                This will permanently delete all completed requests from your history.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Live requests (pending, waiting, printing) will not be affected.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowClearConfirmation(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-lg transition-all"
                  disabled={clearingHistory}
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearHistory}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                  disabled={clearingHistory}
                >
                  {clearingHistory ? "Clearing..." : "Clear History"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRequestDashboard;
