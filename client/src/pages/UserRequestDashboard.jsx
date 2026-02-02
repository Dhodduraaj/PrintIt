import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSocket } from "../contexts/SocketContext";
import api from "../utils/api";

const UserRequestDashboard = () => {
  const socket = useSocket();

  const [requestsById, setRequestsById] = useState({});
  const [requestIds, setRequestIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearingHistory, setClearingHistory] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);

  const HISTORY_PAGE_SIZE = 8;
  const LIVE_STATUSES = useMemo(
    () => new Set(["pending", "waiting", "printing"]),
    []
  );
  const HISTORY_STATUSES = useMemo(() => new Set(["done"]), []);
  const STATUS_RANK = useMemo(
    () => ({ pending: 1, waiting: 2, printing: 3, done: 4 }),
    []
  );

  const normalizeRequests = useCallback((requests) => {
    const normalized = {};
    const ids = [];

    requests.forEach((req) => {
      normalized[req._id] = req;
      ids.push(req._id);
    });

    return { normalized, ids };
  }, []);

  const upsertRequests = useCallback((requests) => {
    if (!requests || requests.length === 0) return;

    const { normalized, ids } = normalizeRequests(requests);

    setRequestsById((prev) => ({
      ...prev,
      ...normalized,
    }));

    setRequestIds((prev) => {
      const merged = new Set(prev);
      ids.forEach((id) => merged.add(id));
      return Array.from(merged);
    });
  }, [normalizeRequests]);

  const fetchAllRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/student/requests/all");
      const liveRequestsResponse = response.data.liveRequests || [];
      const historyRequestsResponse = response.data.historyRequests || [];
      const combined = [...liveRequestsResponse, ...historyRequestsResponse];
      upsertRequests(combined);
      setHistoryPage(1);
    } catch (err) {
      console.error("Error fetching requests:", err);
      if (err.response?.status !== 401) {
        toast.error("Failed to load requests");
      }
    } finally {
      setLoading(false);
    }
  }, [upsertRequests]);

  // Fetch all requests on mount
  useEffect(() => {
    fetchAllRequests();
  }, [fetchAllRequests]);

  const allRequests = useMemo(() => {
    return requestIds
      .map((id) => requestsById[id])
      .filter(Boolean);
  }, [requestIds, requestsById]);

  const liveRequests = useMemo(() => {
    return allRequests
      .filter((req) => LIVE_STATUSES.has(req.status))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [allRequests, LIVE_STATUSES]);

  const historyRequests = useMemo(() => {
    return allRequests
      .filter((req) => HISTORY_STATUSES.has(req.status))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [allRequests, HISTORY_STATUSES]);

  const paginatedHistory = useMemo(() => {
    const endIndex = historyPage * HISTORY_PAGE_SIZE;
    return historyRequests.slice(0, endIndex);
  }, [historyRequests, historyPage]);

  const hasMoreHistory = historyRequests.length > paginatedHistory.length;

  // Set up socket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleQueueUpdate = (data) => {
      if (!data?.jobId) return;

      setRequestsById((prev) => {
        const existing = prev[data.jobId];
        if (!existing) return prev;
        if (existing.queuePosition === data.queuePosition) return prev;

        return {
          ...prev,
          [data.jobId]: {
            ...existing,
            queuePosition: data.queuePosition,
          },
        };
      });
    };

    const handleStatusUpdate = (data) => {
      if (!data?.jobId || !data?.status) return;

      setRequestsById((prev) => {
        const existing = prev[data.jobId];
        if (!existing) return prev;
        if (existing.status === data.status) return prev;

        const incomingRank = STATUS_RANK[data.status] || 0;
        const currentRank = STATUS_RANK[existing.status] || 0;
        if (incomingRank < currentRank) return prev;

        return {
          ...prev,
          [data.jobId]: {
            ...existing,
            status: data.status,
            updatedAt: new Date().toISOString(),
          },
        };
      });

      if (data.status === "done") {
        toast.success("Your print is ready for pickup! ✅");
      }
    };

    const handleSocketConnect = () => {
      fetchAllRequests();
    };

    const handleSocketDisconnect = () => {
      toast("Connection lost. Reconnecting...", { icon: "⚠️" });
    };

    socket.on("queue:update", handleQueueUpdate);
    socket.on("request:status", handleStatusUpdate);
    socket.on("queueUpdate", handleQueueUpdate);
    socket.on("jobStatusUpdate", handleStatusUpdate);
    socket.on("connect", handleSocketConnect);
    socket.on("disconnect", handleSocketDisconnect);

    return () => {
      socket.off("queue:update", handleQueueUpdate);
      socket.off("request:status", handleStatusUpdate);
      socket.off("queueUpdate", handleQueueUpdate);
      socket.off("jobStatusUpdate", handleStatusUpdate);
      socket.off("connect", handleSocketConnect);
      socket.off("disconnect", handleSocketDisconnect);
    };
  }, [socket, fetchAllRequests, STATUS_RANK]);

  const handleClearHistory = async () => {
    const previousById = { ...requestsById };
    const previousIds = [...requestIds];
    const historyIdSet = new Set(
      Object.values(requestsById)
        .filter((req) => HISTORY_STATUSES.has(req.status))
        .map((req) => req._id)
    );

    try {
      setClearingHistory(true);
      setRequestsById((prev) => {
        const updated = { ...prev };
        historyIdSet.forEach((id) => {
          delete updated[id];
        });
        return updated;
      });

      setRequestIds((prev) => prev.filter((id) => !historyIdSet.has(id)));

      await api.delete("/api/student/requests/history", {
        data: { confirmed: true },
      });
      setShowClearConfirmation(false);
      toast.success("Request history cleared");
    } catch (err) {
      console.error("Error clearing history:", err);
      setRequestsById(previousById);
      setRequestIds(previousIds);
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
    <div
      className={`bg-white rounded-lg shadow-md p-6 border-l-4 hover:shadow-lg transition-all duration-300 ${
        request.status === "printing"
          ? "border-blue-500 ring-1 ring-blue-200 animate-pulse"
          : "border-purple-500"
      }`}
      aria-live={request.status === "printing" ? "polite" : "off"}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">
            {request.fileName}
          </h4>
          <p className="text-sm text-gray-500 mt-1">
            Request ID: <span className="font-mono">{request._id.slice(-8)}</span>
          </p>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
            request.status
          )}`}
          aria-label={`Status: ${getStatusText(request.status)}`}
        >
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="h-8 w-64 bg-purple-100 rounded animate-pulse" />
            <div className="h-4 w-96 bg-gray-200 rounded mt-3 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-16 bg-gray-200 rounded mt-3 animate-pulse" />
              <div className="h-3 w-48 bg-gray-200 rounded mt-4 animate-pulse" />
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-16 bg-gray-200 rounded mt-3 animate-pulse" />
              <div className="h-3 w-48 bg-gray-200 rounded mt-4 animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="bg-white rounded-lg shadow-md p-6"
                aria-hidden="true"
              >
                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-28 bg-gray-200 rounded mt-3 animate-pulse" />
                <div className="grid grid-cols-2 gap-4 mt-5">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-4 w-40 bg-gray-200 rounded mt-5 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                aria-label="Clear completed request history"
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
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {paginatedHistory.map((request) => (
                  <RequestCard key={request._id} request={request} isLive={false} />
                ))}
              </div>
              {hasMoreHistory && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setHistoryPage((prev) => prev + 1)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-lg transition-all"
                    aria-label="Load more history"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Clear History Confirmation Modal */}
        {showClearConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 animate-in"
              role="dialog"
              aria-modal="true"
              aria-labelledby="clear-history-title"
            >
              <h3
                id="clear-history-title"
                className="text-xl font-bold text-gray-900 mb-3"
              >
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
                  aria-label="Cancel clearing history"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearHistory}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                  disabled={clearingHistory}
                  aria-label="Confirm clear history"
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
