import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-page">
      <div className="hero">
        <div className="container">
          <h1>🖨️ PrintFlow</h1>
          <p className="hero-subtitle">Smart College Printing Management System</p>
          <p className="hero-description">
            Eliminate physical queues. Upload documents, join virtual queue, track in real-time.
            No more crowding, no more waiting.
          </p>
          <div className="hero-actions">
            <Link to="/student/login" className="btn btn-primary btn-large">
              Get Started as Student
            </Link>
            <Link to="/vendor/login" className="btn btn-outline btn-large">
              Vendor Login
            </Link>
          </div>
        </div>
      </div>

      <div className="container">
        <section className="problem-section">
          <h2>🔴 The Real Problem</h2>
          <div className="problem-grid">
            <div className="problem-card">
              <h3>For Students</h3>
              <ul>
                <li>⏰ Waste time standing in long queues</li>
                <li>📚 Miss classes during break time</li>
                <li>❓ Don't know wait times</li>
                <li>😤 Frustration from overcrowding</li>
              </ul>
            </div>
            <div className="problem-card">
              <h3>For Vendors</h3>
              <ul>
                <li>📈 Sudden burst of crowd during breaks</li>
                <li>🤯 Get overloaded and confused</li>
                <li>🔄 Face repeated questions</li>
                <li>⚡ Inefficient service delivery</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="solution-section">
          <h2>🎯 How PrintFlow Solves It</h2>
          <div className="features">
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Virtual Queue System</h3>
              <p>Join a digital queue with token numbers. Track your position in real-time without physical presence.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📤</div>
              <h3>Pre-Break Upload</h3>
              <p>Upload documents before break time. During break, only join queue and pickup. Smart load distribution.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚙️</div>
              <h3>Semi-Automated Printing</h3>
              <p>Vendor approves and prints with 2 clicks. Controlled automation with human oversight for safety.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>UPI Payment Integration</h3>
              <p>Real-world payment handling with UPI reference IDs. One reference = one job. No gateway needed.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Peak-Time Control</h3>
              <p>Handles hundreds of concurrent users. Queue batching, soft waiting pool, and smart traffic management.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Real-Time Updates</h3>
              <p>Live status updates via Socket.IO. No page refreshes needed. Know exactly when your print is ready.</p>
            </div>
          </div>
        </section>

        <section className="flow-section">
          <h2>🔄 How It Works</h2>
          <div className="flow-diagram">
            <div className="flow-step">
              <div className="flow-number">1</div>
              <h4>Upload Document</h4>
              <p>Student uploads PDF/DOC before break</p>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <div className="flow-number">2</div>
              <h4>Join Queue</h4>
              <p>Get token number and queue position</p>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <div className="flow-number">3</div>
              <h4>Make Payment</h4>
              <p>Enter UPI reference ID</p>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <div className="flow-number">4</div>
              <h4>Vendor Processes</h4>
              <p>Vendor approves, prints, marks done</p>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <div className="flow-number">5</div>
              <h4>Pickup</h4>
              <p>Student collects when notified</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Landing;
