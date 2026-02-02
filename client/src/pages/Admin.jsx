import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/api";

const Admin = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get("/api/admin/analytics");
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      toast.error(err.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-purple-900 font-semibold">
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">
            📊 Admin Analytics
          </h1>
          <p className="text-lg text-purple-700">
            System performance and usage statistics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center border-t-4 border-purple-500 hover:shadow-2xl transition-shadow">
            <div className="text-5xl mb-4">📄</div>
            <div className="text-3xl font-bold text-purple-900 mb-2">
              {stats?.totalJobs || 0}
            </div>
            <div className="text-gray-600 font-medium">Total Jobs</div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center border-t-4 border-blue-500 hover:shadow-2xl transition-shadow">
            <div className="text-5xl mb-4">⏱️</div>
            <div className="text-3xl font-bold text-purple-900 mb-2">
              {stats?.avgWaitTime || 0} min
            </div>
            <div className="text-gray-600 font-medium">Avg Wait Time</div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center border-t-4 border-green-500 hover:shadow-2xl transition-shadow">
            <div className="text-5xl mb-4">👥</div>
            <div className="text-3xl font-bold text-purple-900 mb-2">
              {stats?.activeUsers || 0}
            </div>
            <div className="text-gray-600 font-medium">Active Users</div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center border-t-4 border-yellow-500 hover:shadow-2xl transition-shadow">
            <div className="text-5xl mb-4">✅</div>
            <div className="text-3xl font-bold text-purple-900 mb-2">
              {stats?.completedToday || 0}
            </div>
            <div className="text-gray-600 font-medium">Completed Today</div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center border-t-4 border-indigo-500 hover:shadow-2xl transition-shadow">
            <div className="text-5xl mb-4">📈</div>
            <div className="text-3xl font-bold text-purple-900 mb-2">
              {stats?.peakHourJobs || 0}
            </div>
            <div className="text-gray-600 font-medium">Peak Hour Jobs</div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center border-t-4 border-pink-500 hover:shadow-2xl transition-shadow">
            <div className="text-5xl mb-4">💰</div>
            <div className="text-3xl font-bold text-purple-900 mb-2">
              ₹{stats?.totalRevenue || 0}
            </div>
            <div className="text-gray-600 font-medium">Total Revenue</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-purple-900 mb-6">
            📊 Job Status Distribution
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-32 text-gray-700 font-medium">Waiting</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full flex items-center justify-end pr-2 text-white text-sm font-semibold"
                  style={{
                    width: `${((stats?.statusCounts?.waiting || 0) / (stats?.totalJobs || 1)) * 100}%`,
                  }}
                >
                  {stats?.statusCounts?.waiting || 0}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-gray-700 font-medium">Printing</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full flex items-center justify-end pr-2 text-white text-sm font-semibold"
                  style={{
                    width: `${((stats?.statusCounts?.printing || 0) / (stats?.totalJobs || 1)) * 100}%`,
                  }}
                >
                  {stats?.statusCounts?.printing || 0}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-gray-700 font-medium">Done</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  className="bg-green-500 h-full rounded-full flex items-center justify-end pr-2 text-white text-sm font-semibold"
                  style={{
                    width: `${((stats?.statusCounts?.done || 0) / (stats?.totalJobs || 1)) * 100}%`,
                  }}
                >
                  {stats?.statusCounts?.done || 0}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-gray-700 font-medium">
                Pending Payment
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  className="bg-yellow-500 h-full rounded-full flex items-center justify-end pr-2 text-white text-sm font-semibold"
                  style={{
                    width: `${((stats?.statusCounts?.pending || 0) / (stats?.totalJobs || 1)) * 100}%`,
                  }}
                >
                  {stats?.statusCounts?.pending || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-purple-900 mb-6">
            ⏰ Peak Time Analysis
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong className="text-purple-900">Busiest Hour:</strong>{" "}
              {stats?.peakHour || "N/A"}
            </p>
            <p>
              <strong className="text-purple-900">Jobs in Peak Hour:</strong>{" "}
              {stats?.peakHourJobs || 0}
            </p>
            <p>
              <strong className="text-purple-900">
                Average Processing Time:
              </strong>{" "}
              {stats?.avgProcessingTime || 0} minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
