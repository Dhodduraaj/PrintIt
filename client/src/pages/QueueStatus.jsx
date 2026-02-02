import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';
import './QueueStatus.css';

const QueueStatus = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const jobId = location.state?.jobId;

  const [job, setJob] = useState(null);
  const [queuePosition, setQueuePosition] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) {
      fetchLatestJob();
    } else {
      fetchJobStatus();
    }
  }, [jobId]);

  useEffect(() => {
    if (!socket) return;

    socket.on('queueUpdate', (data) => {
      if (data.jobId === job?._id) {
        setJob(data.job);
        setQueuePosition(data.queuePosition);
      }
    });

    socket.on('jobStatusUpdate', (data) => {
      if (data.jobId === job?._id) {
        setJob((prev) => ({ ...prev, status: data.status }));
      }
    });

    return () => {
      socket.off('queueUpdate');
      socket.off('jobStatusUpdate');
    };
  }, [socket, job]);

  const fetchLatestJob = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/student/latest-job', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.data.job) {
        setJob(response.data.job);
        setQueuePosition(response.data.queuePosition);
      }
    } catch (err) {
      console.error('Error fetching job:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobStatus = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/student/job/${jobId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setJob(response.data.job);
      setQueuePosition(response.data.queuePosition);
    } catch (err) {
      console.error('Error fetching job:', err);
    } finally {
      setLoading(false);
    }
  };

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
      waiting: 'Waiting in Queue',
      printing: 'Currently Printing',
      done: 'Ready for Pickup',
      pending: 'Payment Pending',
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="queue-status">
        <div className="container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="queue-status">
        <div className="container">
          <div className="card">
            <h2>No Active Jobs</h2>
            <p>You don't have any active print jobs.</p>
            <button onClick={() => navigate('/student/dashboard')} className="btn btn-primary">
              Upload Document
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="queue-status">
      <div className="container">
        <div className="token-display">
          <h2>Your Token Number</h2>
          <div className="token-number">{job.tokenNumber || '---'}</div>
          <div className={`status-indicator ${job.status}`}>
            <span className={`status-dot ${job.status}`}></span>
            <span className="status-text">{getStatusText(job.status)}</span>
          </div>
        </div>

        <div className="queue-card">
          <h3>Queue Information</h3>
          <div className="queue-info">
            <div className="info-item">
              <span className="info-label">Position in Queue:</span>
              <span className="info-value">{queuePosition > 0 ? `#${queuePosition}` : 'Processing...'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Document:</span>
              <span className="info-value">{job.fileName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Pages:</span>
              <span className="info-value">{job.pageCount}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Type:</span>
              <span className="info-value">
                {job.printType === 'color' ? 'Color' : 'Black & White'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Copies:</span>
              <span className="info-value">{job.copies}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className={`badge ${getStatusBadge(job.status)}`}>
                {getStatusText(job.status)}
              </span>
            </div>
          </div>
        </div>

        {job.status === 'pending' && (
          <div className="card">
            <h3>💳 Payment Required</h3>
            <p>Please complete payment to proceed with printing.</p>
            <button
              onClick={() => navigate('/student/payment', { state: { jobId: job._id } })}
              className="btn btn-primary"
            >
              Complete Payment
            </button>
          </div>
        )}

        {job.status === 'done' && (
          <div className="card success-card">
            <h3>✅ Print Ready!</h3>
            <p>Your document has been printed and is ready for pickup.</p>
            <p className="pickup-info">
              Please collect your print from the vendor counter.
            </p>
          </div>
        )}

        <div className="actions">
          <button onClick={() => navigate('/student/dashboard')} className="btn btn-outline">
            Upload Another Document
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueueStatus;
