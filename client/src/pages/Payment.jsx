import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './Payment.css';

const Payment = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const jobId = location.state?.jobId;

  const [job, setJob] = useState(null);
  const [upiRef, setUpiRef] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!jobId) {
      navigate('/student/dashboard');
      return;
    }
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/student/job/${jobId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setJob(response.data.job);
    } catch (err) {
      setError('Failed to load job details');
    }
  };

  const calculateAmount = () => {
    if (!job) return 0;
    const pageRate = job.printType === 'color' ? 5 : 2;
    return job.pageCount * pageRate * job.copies;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!upiRef.trim()) {
      setError('Please enter UPI reference ID');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await axios.post(
        `http://localhost:5000/api/student/payment/${jobId}`,
        { upiReferenceId: upiRef.trim() },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        navigate('/student/queue', { state: { jobId } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment verification failed. Please check your reference ID.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!job) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="container">
        <div className="payment-header">
          <h1>💳 Payment Confirmation</h1>
          <p>Enter your UPI payment reference ID</p>
        </div>

        <div className="card">
          <h3>Order Summary</h3>
          <div className="order-details">
            <div className="detail-row">
              <span>Document:</span>
              <span>{job.fileName}</span>
            </div>
            <div className="detail-row">
              <span>Pages:</span>
              <span>{job.pageCount}</span>
            </div>
            <div className="detail-row">
              <span>Type:</span>
              <span>{job.printType === 'color' ? 'Color' : 'Black & White'}</span>
            </div>
            <div className="detail-row">
              <span>Copies:</span>
              <span>{job.copies}</span>
            </div>
            <div className="detail-row total">
              <span>Total Amount:</span>
              <span className="amount">₹{calculateAmount()}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>UPI Payment</h3>
          <div className="upi-qr-container">
            <div className="upi-qr-placeholder">
              <div className="qr-code">📱</div>
              <p>Scan QR Code to Pay</p>
              <p className="upi-id">UPI ID: vendor@printflow</p>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>UPI Reference ID</label>
              <input
                type="text"
                value={upiRef}
                onChange={(e) => {
                  setUpiRef(e.target.value);
                  setError('');
                }}
                placeholder="Enter UPI transaction reference ID"
                required
                className="upi-input"
              />
              <small className="input-hint">
                Find this in your payment app after completing the transaction
              </small>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={submitting}
            >
              {submitting ? 'Verifying...' : 'Confirm Payment'}
            </button>
          </form>
        </div>

        <div className="info-card">
          <h4>⚠️ Important Notes</h4>
          <ul>
            <li>Each UPI reference ID can only be used once</li>
            <li>Payment verification may take a few moments</li>
            <li>Keep your payment receipt until verification is complete</li>
            <li>Contact vendor if payment is not verified within 5 minutes</li>
          </ul>
        </div>

        <div className="actions">
          <button
            onClick={() => navigate('/student/queue', { state: { jobId } })}
            className="btn btn-outline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
