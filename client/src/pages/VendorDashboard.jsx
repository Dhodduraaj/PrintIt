import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';
import './VendorDashboard.css';

const VendorDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, waiting, printing, done

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('newJob', (job) => {
      setJobs((prev) => [job, ...prev]);
    });

    socket.on('jobUpdated', (updatedJob) => {
      setJobs((prev) =>
        prev.map((j) => (j._id === updatedJob._id ? updatedJob : j))
      );
    });

    return () => {
      socket.off('newJob');
      socket.off('jobUpdated');
    };
  }, [socket]);

  const fetchJobs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/vendor/jobs', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setJobs(response.data.jobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (jobId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/vendor/jobs/${jobId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve job');
    }
  };

  const handleVerifyPayment = async (jobId, upiRef) => {
    try {
      await axios.post(
        `http://localhost:5000/api/vendor/jobs/${jobId}/verify-payment`,
        { upiReferenceId: upiRef },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment verification failed');
    }
  };

  const handleMarkDone = async (jobId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/vendor/jobs/${jobId}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as done');
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (filter === 'all') return true;
    return job.status === filter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      waiting: 'badge-waiting',
      printing: 'badge-printing',
      done: 'badge-done',
      pending: 'badge-pending',
    };
    return badges[status] || 'badge-waiting';
  };

  const getStatusText = (status) => {
    const texts = {
      waiting: 'Waiting',
      printing: 'Printing',
      done: 'Done',
      pending: 'Payment Pending',
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="vendor-dashboard">
        <div className="container">
          <div className="loading">Loading jobs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>🏪 Vendor Dashboard</h1>
          <p>Welcome, {user?.name}</p>
        </div>

        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-value">{jobs.filter((j) => j.status === 'waiting').length}</div>
            <div className="stat-label">Waiting</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{jobs.filter((j) => j.status === 'printing').length}</div>
            <div className="stat-label">Printing</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{jobs.filter((j) => j.status === 'pending').length}</div>
            <div className="stat-label">Payment Pending</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{jobs.filter((j) => j.status === 'done').length}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        <div className="filter-tabs">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All Jobs
          </button>
          <button
            className={filter === 'waiting' ? 'active' : ''}
            onClick={() => setFilter('waiting')}
          >
            Waiting
          </button>
          <button
            className={filter === 'printing' ? 'active' : ''}
            onClick={() => setFilter('printing')}
          >
            Printing
          </button>
          <button
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Payment Pending
          </button>
        </div>

        <div className="job-list">
          {filteredJobs.length === 0 ? (
            <div className="empty-state">
              <p>No jobs found</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div key={job._id} className="job-item">
                <div className="job-info">
                  <div className="job-header">
                    <h3>Token #{job.tokenNumber}</h3>
                    <span className={`badge ${getStatusBadge(job.status)}`}>
                      {getStatusText(job.status)}
                    </span>
                  </div>
                  <div className="job-details">
                    <p><strong>Student:</strong> {job.student?.name || 'N/A'}</p>
                    <p><strong>Document:</strong> {job.fileName}</p>
                    <p><strong>Pages:</strong> {job.pageCount} × {job.copies} copies</p>
                    <p><strong>Type:</strong> {job.printType === 'color' ? 'Color' : 'Black & White'}</p>
                    {job.upiReferenceId && (
                      <p><strong>UPI Ref:</strong> <code>{job.upiReferenceId}</code></p>
                    )}
                  </div>
                </div>
                <div className="job-actions">
                  {job.status === 'pending' && (
                    <div className="payment-verification">
                      <input
                        type="text"
                        placeholder="Enter UPI Ref ID"
                        className="upi-input-small"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target.value) {
                            handleVerifyPayment(job._id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const refId = prompt('Enter UPI Reference ID:');
                          if (refId) handleVerifyPayment(job._id, refId);
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        Verify Payment
                      </button>
                    </div>
                  )}
                  {job.status === 'waiting' && (
                    <button
                      onClick={() => handleApprove(job._id)}
                      className="btn btn-primary"
                    >
                      ✅ Approve & Print
                    </button>
                  )}
                  {job.status === 'printing' && (
                    <button
                      onClick={() => handleMarkDone(job._id)}
                      className="btn btn-secondary"
                    >
                      ✓ Mark as Done
                    </button>
                  )}
                  <a
                    href={`http://localhost:5000/api/vendor/jobs/${job._id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                  >
                    📥 Download
                  </a>
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
