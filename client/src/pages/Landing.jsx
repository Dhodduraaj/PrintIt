import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-4">🖨️ PrintFlow</h1>
            <p className="text-3xl text-purple-200 mb-6 font-semibold">Smart College Printing Management System</p>
            <p className="text-xl text-purple-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Eliminate physical queues. Upload documents, join virtual queue, track in real-time.
              No more crowding, no more waiting.
            </p>
            <div className="flex gap-6 justify-center flex-wrap">
              <Link to="/student/login" className="px-8 py-4 bg-white text-purple-900 rounded-lg font-semibold text-lg hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                Get Started as Student
              </Link>
              <Link to="/vendor/login" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-purple-900 transition-all shadow-lg">
                Vendor Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-center text-purple-900 mb-12">🔴 The Real Problem</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-200 hover:border-purple-400 transition-all">
              <h3 className="text-2xl font-bold text-purple-900 mb-6">For Students</h3>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3"><span className="text-2xl">⏰</span><span>Waste time standing in long queues</span></li>
                <li className="flex items-start gap-3"><span className="text-2xl">📚</span><span>Miss classes during break time</span></li>
                <li className="flex items-start gap-3"><span className="text-2xl">❓</span><span>Don't know wait times</span></li>
                <li className="flex items-start gap-3"><span className="text-2xl">😤</span><span>Frustration from overcrowding</span></li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-200 hover:border-purple-400 transition-all">
              <h3 className="text-2xl font-bold text-purple-900 mb-6">For Vendors</h3>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3"><span className="text-2xl">📈</span><span>Sudden burst of crowd during breaks</span></li>
                <li className="flex items-start gap-3"><span className="text-2xl">🤯</span><span>Get overloaded and confused</span></li>
                <li className="flex items-start gap-3"><span className="text-2xl">🔄</span><span>Face repeated questions</span></li>
                <li className="flex items-start gap-3"><span className="text-2xl">⚡</span><span>Inefficient service delivery</span></li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-4xl font-bold text-center text-purple-900 mb-12">🎯 How PrintFlow Solves It</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-purple-900 mb-3">Virtual Queue System</h3>
              <p className="text-gray-600">Join a digital queue with token numbers. Track your position in real-time without physical presence.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="text-5xl mb-4">📤</div>
              <h3 className="text-xl font-bold text-purple-900 mb-3">Pre-Break Upload</h3>
              <p className="text-gray-600">Upload documents before break time. During break, only join queue and pickup. Smart load distribution.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="text-5xl mb-4">⚙️</div>
              <h3 className="text-xl font-bold text-purple-900 mb-3">Semi-Automated Printing</h3>
              <p className="text-gray-600">Vendor approves and prints with 2 clicks. Controlled automation with human oversight for safety.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="text-5xl mb-4">💳</div>
              <h3 className="text-xl font-bold text-purple-900 mb-3">UPI Payment Integration</h3>
              <p className="text-gray-600">Real-world payment handling with UPI reference IDs. One reference = one job. No gateway needed.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-purple-900 mb-3">Peak-Time Control</h3>
              <p className="text-gray-600">Handles hundreds of concurrent users. Queue batching, soft waiting pool, and smart traffic management.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-purple-900 mb-3">Real-Time Updates</h3>
              <p className="text-gray-600">Live status updates via Socket.IO. No page refreshes needed. Know exactly when your print is ready.</p>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-4xl font-bold text-center text-purple-900 mb-12">🔄 How It Works</h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center max-w-xs">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h4 className="text-lg font-bold text-purple-900 mb-2">Upload Document</h4>
              <p className="text-gray-600 text-sm">Student uploads PDF/DOC before break</p>
            </div>
            <div className="text-purple-600 text-3xl font-bold hidden md:block">→</div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center max-w-xs">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h4 className="text-lg font-bold text-purple-900 mb-2">Join Queue</h4>
              <p className="text-gray-600 text-sm">Get token number and queue position</p>
            </div>
            <div className="text-purple-600 text-3xl font-bold hidden md:block">→</div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center max-w-xs">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h4 className="text-lg font-bold text-purple-900 mb-2">Make Payment</h4>
              <p className="text-gray-600 text-sm">Enter UPI reference ID</p>
            </div>
            <div className="text-purple-600 text-3xl font-bold hidden md:block">→</div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center max-w-xs">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">4</div>
              <h4 className="text-lg font-bold text-purple-900 mb-2">Vendor Processes</h4>
              <p className="text-gray-600 text-sm">Vendor approves, prints, marks done</p>
            </div>
            <div className="text-purple-600 text-3xl font-bold hidden md:block">→</div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center max-w-xs">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">5</div>
              <h4 className="text-lg font-bold text-purple-900 mb-2">Pickup</h4>
              <p className="text-gray-600 text-sm">Student collects when notified</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Landing;
