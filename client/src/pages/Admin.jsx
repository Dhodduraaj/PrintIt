import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './Admin.css';

const Admin = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/analytics', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="container">
          <div className="loading">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>📊 Admin Analytics</h1>
          <p>System performance and usage statistics</p>
        </div>

        <div className="analytics-grid">
          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div className="stat-value">{stats?.totalJobs || 0}</div>
            <div className="stat-label">Total Jobs</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-value">{stats?.avgWaitTime || 0} min</div>
            <div className="stat-label">Avg Wait Time</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{stats?.activeUsers || 0}</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{stats?.completedToday || 0}</div>
            <div className="stat-label">Completed Today</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-value">{stats?.peakHourJobs || 0}</div>
            <div className="stat-label">Peak Hour Jobs</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-value">₹{stats?.totalRevenue || 0}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>

        <div className="card">
          <h2>📊 Job Status Distribution</h2>
          <div className="status-chart">
            <div className="chart-item">
              <div className="chart-label">Waiting</div>
              <div className="chart-bar">
                <div
                  className="chart-fill waiting"
                  style={{ width: `${(stats?.statusCounts?.waiting || 0) / (stats?.totalJobs || 1) * 100}%` }}
                ></div>
              </div>
              <div className="chart-value">{stats?.statusCounts?.waiting || 0}</div>
            </div>
            <div className="chart-item">
              <div className="chart-label">Printing</div>
              <div className="chart-bar">
                <div
                  className="chart-fill printing"
                  style={{ width: `${(stats?.statusCounts?.printing || 0) / (stats?.totalJobs || 1) * 100}%` }}
                ></div>
              </div>
              <div className="chart-value">{stats?.statusCounts?.printing || 0}</div>
            </div>
            <div className="chart-item">
              <div className="chart-label">Done</div>
              <div className="chart-bar">
                <div
                  className="chart-fill done"
                  style={{ width: `${(stats?.statusCounts?.done || 0) / (stats?.totalJobs || 1) * 100}%` }}
                ></div>
              </div>
              <div className="chart-value">{stats?.statusCounts?.done || 0}</div>
            </div>
            <div className="chart-item">
              <div className="chart-label">Pending Payment</div>
              <div className="chart-bar">
                <div
                  className="chart-fill pending"
                  style={{ width: `${(stats?.statusCounts?.pending || 0) / (stats?.totalJobs || 1) * 100}%` }}
                ></div>
              </div>
              <div className="chart-value">{stats?.statusCounts?.pending || 0}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>⏰ Peak Time Analysis</h2>
          <div className="peak-time-info">
            <p><strong>Busiest Hour:</strong> {stats?.peakHour || 'N/A'}</p>
            <p><strong>Jobs in Peak Hour:</strong> {stats?.peakHourJobs || 0}</p>
            <p><strong>Average Processing Time:</strong> {stats?.avgProcessingTime || 0} minutes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
