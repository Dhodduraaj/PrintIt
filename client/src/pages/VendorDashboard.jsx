import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import api from "../utils/api";

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
      const vendorId = job.vendor?._id || job.vendor;
      if (vendorId === user._id) {
        setJobs((prev) => [...prev, job]);
        toast.success(`New job received: Token #${job.tokenNumber}`);
      }
    });

    socket.on("jobUpdated", (updatedJob) => {
      const vendorId = updatedJob.vendor?._id || updatedJob.vendor;
      if (vendorId === user._id) {
        setJobs((prev) =>
          prev.map((j) => (j._id === updatedJob._id ? updatedJob : j)),
        );
        toast(`Job updated: Token #${updatedJob.tokenNumber}`, { icon: "🔄" });
      }
    });

    socket.on("jobDeleted", ({ jobId }) => {
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      toast("Job removed from queue.", { icon: "🗑️" });
    });

    return () => {
      socket.off("newJob");
      socket.off("jobUpdated");
      socket.off("jobDeleted");
    };
  }, [socket]);

  const fetchJobs = async () => {
    try {
      const response = await api.get("/api/vendor/jobs");
      setJobs(response.data.jobs);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      toast.error(err.response?.data?.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (jobId) => {
    try {
      await api.post(`/api/vendor/jobs/${jobId}/approve`);
      toast.success("Job approved. Printing started.");
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve job");
    }
  };

  const handleMarkDone = async (jobId) => {
    try {
      await api.post(`/api/vendor/jobs/${jobId}/complete`);
      toast.success("Job marked as done.");
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark as done");
    }
  };

  const handleDelete = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job and its document? This action cannot be undone.",
    );
    if (!confirmed) return;

    try {
      await api.delete(`/api/vendor/jobs/${jobId}`);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      toast.success("Job deleted successfully.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete job");
    }
  };

  const handleDeleteDoneHistory = async () => {
    const doneCount = jobs.filter((j) => j.status === "done").length;
    if (doneCount === 0) {
      toast("No completed jobs to delete.");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete all ${doneCount} completed job(s)? This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      await api.delete("/api/vendor/jobs/done-history");
      setJobs((prev) => prev.filter((j) => j.status !== "done"));
      toast.success("Done history deleted.");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to delete done history",
      );
    }
  };

  const handleDownload = async (job) => {
    try {
      const response = await api.get(`/api/vendor/jobs/${job._id}/download`, {
        responseType: "blob",
      });
      const blob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = job.fileName || "document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      toast.success("Download started.");
    } catch (err) {
      let message = "Failed to download file";
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          if (json.message) message = json.message;
        } catch (_) {}
      } else if (typeof err.response?.data?.message === "string") {
        message = err.response.data.message;
      }
      toast.error(message);
    }
  };

  const sortedJobs = [...jobs].sort((a, b) => {
    const aDone = a.status === "done";
    const bDone = b.status === "done";
    if (aDone !== bDone) return aDone ? 1 : -1;

    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return aTime - bTime;
  });

  const filteredJobs = sortedJobs.filter((job) => {
    if (filter === "all") return true;
    return job.status === filter;
  });

  // Group jobs by UPI reference ID (same payment transaction)
  const groupedJobs = filteredJobs.reduce((groups, job) => {
    const key = job.upiReferenceId || job._id; // Group by payment ID, or use job ID if no payment
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(job);
    return groups;
  }, {});

  // Convert to array of groups sorted by first job's creation time
  const jobGroups = Object.values(groupedJobs).sort((a, b) => {
    const aTime = new Date(a[0].createdAt).getTime();
    const bTime = new Date(b[0].createdAt).getTime();
    return aTime - bTime;
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

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
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
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-2 border-green-200">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {jobs.filter((j) => j.status === "done").length}
            </div>
            <div className="text-sm font-semibold text-gray-600">Completed</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6 overflow-x-auto pb-2">
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
          {filter === "all" && (
            <button
              type="button"
              onClick={handleDeleteDoneHistory}
              className="px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap bg-red-600 text-white hover:bg-red-700 shadow-lg"
            >
              Delete Done History
            </button>
          )}
        </div>

        <div className="space-y-4">
          {jobGroups.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-gray-500 text-lg">No jobs found</p>
            </div>
          ) : (
            jobGroups.map((group) => {
              const isMultiFile = group.length > 1;
              const firstJob = group[0];

              return (
                <div
                  key={firstJob.upiReferenceId || firstJob._id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
                >
                  {/* Group Header */}
                  {isMultiFile && (
                    <div className="mb-4 pb-3 border-b border-purple-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📦</span>
                          <div>
                            <h3 className="text-lg font-bold text-purple-900">
                              Batch Request - {group.length} Files
                            </h3>
                            <p className="text-sm text-gray-600">
                              Student: {firstJob.student?.name || "N/A"}
                            </p>
                          </div>
                        </div>
                        {firstJob.upiReferenceId && (
                          <div className="text-right">
                            <p className="text-xs text-gray-500">UPI Ref:</p>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {firstJob.upiReferenceId}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Jobs in the group */}
                  <div className="space-y-4">
                    {group.map((job, index) => (
                      <div
                        key={job._id}
                        className={`${isMultiFile ? "bg-purple-50 rounded-lg p-4 border border-purple-200" : ""}`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                              {isMultiFile && (
                                <span className="text-sm font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded">
                                  #{index + 1}
                                </span>
                              )}
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
                            <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-700">
                              {!isMultiFile && (
                                <p>
                                  <strong className="text-purple-900">
                                    Student:
                                  </strong>{" "}
                                  {job.student?.name || "N/A"}
                                </p>
                              )}
                              <p className={!isMultiFile ? "" : "col-span-2"}>
                                <strong className="text-purple-900">
                                  Document:
                                </strong>{" "}
                                {job.fileName}
                              </p>
                              <p>
                                <strong className="text-purple-900">
                                  Page Range:
                                </strong>{" "}
                                {job.pageRange || "All pages"}
                              </p>
                              <p>
                                <strong className="text-purple-900">
                                  Pages:
                                </strong>{" "}
                                {job.pageCount} × {job.copies} copies
                              </p>
                              <p>
                                <strong className="text-purple-900">
                                  Print Type:
                                </strong>{" "}
                                {job.printType === "color"
                                  ? "Color"
                                  : "Black & White"}
                              </p>
                              <p>
                                <strong className="text-purple-900">
                                  Sides:
                                </strong>{" "}
                                {job.duplex === "single-sided"
                                  ? "Single Sided"
                                  : job.duplex === "double-sided"
                                    ? "Double Sided"
                                    : job.duplex === "double-sided-flip-long"
                                      ? "Double Sided (Flip Long)"
                                      : job.duplex === "double-sided-flip-short"
                                        ? "Double Sided (Flip Short)"
                                        : "Single Sided"}
                              </p>
                              <p>
                                <strong className="text-purple-900">
                                  Paper Size:
                                </strong>{" "}
                                {job.paperSize || "A4"}
                              </p>
                              <p>
                                <strong className="text-purple-900">
                                  Orientation:
                                </strong>{" "}
                                {job.orientation === "portrait"
                                  ? "Portrait"
                                  : "Landscape"}
                              </p>
                              <p>
                                <strong className="text-purple-900">
                                  Pages Per Sheet:
                                </strong>{" "}
                                {job.pagesPerSheet || 1} Page
                                {job.pagesPerSheet > 1 ? "s" : ""}
                              </p>
                              {job.upiReferenceId && !isMultiFile && (
                                <p className="col-span-2">
                                  <strong className="text-purple-900">
                                    UPI Ref:
                                  </strong>{" "}
                                  <code className="bg-gray-100 px-2 py-1 rounded">
                                    {job.upiReferenceId}
                                  </code>
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-3 lg:min-w-[200px]">
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
                            <button
                              type="button"
                              onClick={() => handleDownload(job)}
                              className="text-center px-6 py-2 bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold rounded-lg transition-all"
                            >
                              📥 Download
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(job._id)}
                              className="text-center px-6 py-2 bg-red-600 text-white hover:bg-red-700 font-semibold rounded-lg transition-all"
                            >
                              🗑 Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
