import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import api, { API_BASE_URL } from "../utils/api";

const VendorDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, waiting, printing, done

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("newJob", (job) => {
      setJobs((prev) => [job, ...prev]);
    });

    socket.on("jobUpdated", (updatedJob) => {
      setJobs((prev) =>
        prev.map((j) => (j._id === updatedJob._id ? updatedJob : j)),
      );
    });

    return () => {
      socket.off("newJob");
      socket.off("jobUpdated");
    };
  }, [socket]);

  const fetchJobs = async () => {
    try {
      const response = await api.get("/api/vendor/jobs");
      setJobs(response.data.jobs);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (jobId) => {
    try {
      await api.post(`/api/vendor/jobs/${jobId}/approve`);
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve job");
    }
  };

  const handleVerifyPayment = async (jobId, upiRef) => {
    try {
      await api.post(`/api/vendor/jobs/${jobId}/verify-payment`, {
        upiReferenceId: upiRef,
      });
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || "Payment verification failed");
    }
  };

  const handleMarkDone = async (jobId) => {
    try {
      await api.post(`/api/vendor/jobs/${jobId}/complete`);
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark as done");
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (filter === "all") return true;
    return job.status === filter;
  });

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
      waiting: "Waiting",
      printing: "Printing",
      done: "Done",
      pending: "Payment Pending",
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-purple-900 font-semibold">
          Loading jobs...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">
            🏪 Vendor Dashboard
          </h1>
          <p className="text-lg text-purple-700">Welcome, {user?.name}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-2 border-purple-200">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {jobs.filter((j) => j.status === "waiting").length}
            </div>
            <div className="text-sm font-semibold text-gray-600">Waiting</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-2 border-blue-200">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {jobs.filter((j) => j.status === "printing").length}
            </div>
            <div className="text-sm font-semibold text-gray-600">Printing</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-2 border-yellow-200">
            <div className="text-4xl font-bold text-yellow-600 mb-2">
              {jobs.filter((j) => j.status === "pending").length}
            </div>
            <div className="text-sm font-semibold text-gray-600">
              Payment Pending
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-2 border-green-200">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {jobs.filter((j) => j.status === "done").length}
            </div>
            <div className="text-sm font-semibold text-gray-600">Completed</div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${filter === "all" ? "bg-purple-600 text-white shadow-lg" : "bg-white text-purple-600 hover:bg-purple-50"}`}
            onClick={() => setFilter("all")}
          >
            All Jobs
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${filter === "waiting" ? "bg-purple-600 text-white shadow-lg" : "bg-white text-purple-600 hover:bg-purple-50"}`}
            onClick={() => setFilter("waiting")}
          >
            Waiting
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${filter === "printing" ? "bg-purple-600 text-white shadow-lg" : "bg-white text-purple-600 hover:bg-purple-50"}`}
            onClick={() => setFilter("printing")}
          >
            Printing
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${filter === "pending" ? "bg-purple-600 text-white shadow-lg" : "bg-white text-purple-600 hover:bg-purple-50"}`}
            onClick={() => setFilter("pending")}
          >
            Payment Pending
          </button>
        </div>

        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-gray-500 text-lg">No jobs found</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="text-2xl font-bold text-purple-900">
                        Token #{job.tokenNumber}
                      </h3>
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
                    <div className="grid md:grid-cols-2 gap-3 text-gray-700">
                      <p>
                        <strong className="text-purple-900">Student:</strong>{" "}
                        {job.student?.name || "N/A"}
                      </p>
                      <p>
                        <strong className="text-purple-900">Document:</strong>{" "}
                        {job.fileName}
                      </p>
                      <p>
                        <strong className="text-purple-900">Pages:</strong>{" "}
                        {job.pageCount} × {job.copies} copies
                      </p>
                      <p>
                        <strong className="text-purple-900">Type:</strong>{" "}
                        {job.printType === "color" ? "Color" : "Black & White"}
                      </p>
                      {job.upiReferenceId && (
                        <p className="col-span-2">
                          <strong className="text-purple-900">UPI Ref:</strong>{" "}
                          <code className="bg-gray-100 px-2 py-1 rounded">
                            {job.upiReferenceId}
                          </code>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 lg:min-w-[200px]">
                    {job.status === "pending" && (
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            const refId = prompt("Enter UPI Reference ID:");
                            if (refId) handleVerifyPayment(job._id, refId);
                          }}
                          className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-all"
                        >
                          Verify Payment
                        </button>
                      </div>
                    )}
                    {job.status === "waiting" && (
                      <button
                        onClick={() => handleApprove(job._id)}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg"
                      >
                        ✅ Approve & Print
                      </button>
                    )}
                    {job.status === "printing" && (
                      <button
                        onClick={() => handleMarkDone(job._id)}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all shadow-lg"
                      >
                        ✓ Mark as Done
                      </button>
                    )}
                    <a
                      href={`${API_BASE_URL}/api/vendor/jobs/${job._id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-center px-6 py-2 bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold rounded-lg transition-all"
                    >
                      📥 Download
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
