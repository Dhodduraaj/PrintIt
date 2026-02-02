import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    file: null,
    fileName: '',
    pageCount: '',
    printType: 'black-white',
    copies: 1,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
        setError('Please upload PDF or DOC files only');
        return;
      }
      setFormData({ ...formData, file, fileName: file.name });
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
        setError('Please upload PDF or DOC files only');
        return;
      }
      setFormData({ ...formData, file, fileName: file.name });
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', formData.file);
      uploadFormData.append('pageCount', formData.pageCount);
      uploadFormData.append('printType', formData.printType);
      uploadFormData.append('copies', formData.copies);

      const response = await axios.post(
        'http://localhost:5000/api/student/upload',
        uploadFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      navigate('/student/queue', { state: { jobId: response.data.jobId } });
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="student-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome, {user?.name}!</h1>
          <p>Upload your document and join the virtual queue</p>
        </div>

        <div className="card">
          <h2>📤 Upload Document</h2>
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div
              className="file-upload-area"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon">📄</div>
              <p className="upload-text">
                {formData.fileName || 'Click or drag file here to upload'}
              </p>
              <p className="upload-hint">PDF or DOC files only (Max 10MB)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>

            {formData.fileName && (
              <div className="file-info">
                <span>📎 {formData.fileName}</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, file: null, fileName: '' })}
                  className="btn-remove"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="form-row">
              <div className="input-group">
                <label>Page Count</label>
                <input
                  type="number"
                  min="1"
                  value={formData.pageCount}
                  onChange={(e) => setFormData({ ...formData, pageCount: e.target.value })}
                  required
                  placeholder="Number of pages"
                />
              </div>

              <div className="input-group">
                <label>Print Type</label>
                <select
                  value={formData.printType}
                  onChange={(e) => setFormData({ ...formData, printType: e.target.value })}
                  required
                >
                  <option value="black-white">Black & White</option>
                  <option value="color">Color</option>
                </select>
              </div>

              <div className="input-group">
                <label>Copies</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.copies}
                  onChange={(e) => setFormData({ ...formData, copies: e.target.value })}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={uploading || !formData.file}
            >
              {uploading ? 'Uploading...' : '📤 Upload & Join Queue'}
            </button>
          </form>
        </div>

        <div className="info-card">
          <h3>💡 Pro Tip</h3>
          <p>
            Upload your documents <strong>before break time</strong> to avoid peak-hour congestion.
            During break, you'll only need to join the queue and pick up your prints!
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
