import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-purple-100/40">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="inline-block mb-2">
              <div className="text-4xl mb-2 animate-pulse">🖨️</div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent mb-2 leading-tight">
              PrintFlow
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-2 font-light">
              Smart College Printing Management System
            </p>
            <p className="text-sm text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed font-light">
              Eliminate physical queues. Upload documents, join virtual queue, track in real-time. <span className="text-purple-600 font-medium">No more crowding, no more waiting.</span>
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link 
                to="/student/login" 
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full font-medium text-sm hover:shadow-lg hover:scale-105 transition-all duration-300 ease-out shadow-md"
              >
                Get Started as Student
              </Link>
              <Link 
                to="/vendor/login" 
                className="px-6 py-2 bg-white border-2 border-purple-300 text-purple-700 rounded-full font-medium text-sm hover:border-purple-500 hover:bg-purple-50 hover:shadow-lg transition-all duration-300 shadow-sm"
              >
                Vendor Login
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Problem Section */}
        <section className="mb-8">
          <div className="text-center mb-4">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent mb-1">
              The Real Problem
            </h2>
            <p className="text-gray-500 text-xs font-light">Current challenges faced by everyone</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg p-4 border border-purple-100 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">👨‍🎓</span>
                <h3 className="text-base font-semibold text-gray-800">For Students</h3>
              </div>
              <ul className="space-y-1.5 text-gray-600">
                <li className="flex items-start gap-2 group">
                  <span className="text-sm mt-0.5 group-hover:scale-110 transition-transform">⏰</span>
                  <span className="font-light text-xs">Waste time in long queues</span>
                </li>
                <li className="flex items-start gap-2 group">
                  <span className="text-sm mt-0.5 group-hover:scale-110 transition-transform">📚</span>
                  <span className="font-light text-xs">Miss classes during breaks</span>
                </li>
                <li className="flex items-start gap-2 group">
                  <span className="text-sm mt-0.5 group-hover:scale-110 transition-transform">❓</span>
                  <span className="font-light text-xs">Don't know wait times</span>
                </li>
                <li className="flex items-start gap-2 group">
                  <span className="text-sm mt-0.5 group-hover:scale-110 transition-transform">😤</span>
                  <span className="font-light text-xs">Frustration from overcrowding</span>
                </li>
              </ul>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg p-4 border border-purple-100 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🏪</span>
                <h3 className="text-base font-semibold text-gray-800">For Vendors</h3>
              </div>
              <ul className="space-y-1.5 text-gray-600">
                <li className="flex items-start gap-2 group">
                  <span className="text-sm mt-0.5 group-hover:scale-110 transition-transform">📈</span>
                  <span className="font-light text-xs">Sudden burst of crowd</span>
                </li>
                <li className="flex items-start gap-2 group">
                  <span className="text-sm mt-0.5 group-hover:scale-110 transition-transform">🤯</span>
                  <span className="font-light text-xs">Get overloaded and confused</span>
                </li>
                <li className="flex items-start gap-2 group">
                  <span className="text-sm mt-0.5 group-hover:scale-110 transition-transform">🔄</span>
                  <span className="font-light text-xs">Face repeated questions</span>
                </li>
                <li className="flex items-start gap-2 group">
                  <span className="text-sm mt-0.5 group-hover:scale-110 transition-transform">⚡</span>
                  <span className="font-light text-xs">Inefficient service delivery</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="mb-8">
          <div className="text-center mb-4">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent mb-1">
              How PrintFlow Solves It
            </h2>
            <p className="text-gray-500 text-xs font-light">Everything you need for seamless printing</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-purple-50/50 to-white rounded-xl shadow-sm hover:shadow-md p-4 transition-all duration-300 hover:-translate-y-1 border border-purple-100/50">
              <div className="text-2xl mb-2">📋</div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">Virtual Queue System</h3>
              <p className="text-gray-600 font-light text-xs leading-snug">Digital queue with real-time tracking</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50/50 to-white rounded-xl shadow-sm hover:shadow-md p-4 transition-all duration-300 hover:-translate-y-1 border border-purple-100/50">
              <div className="text-2xl mb-2">📤</div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">Pre-Break Upload</h3>
              <p className="text-gray-600 font-light text-xs leading-snug">Upload early, pickup during break</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50/50 to-white rounded-xl shadow-sm hover:shadow-md p-4 transition-all duration-300 hover:-translate-y-1 border border-purple-100/50">
              <div className="text-2xl mb-2">⚙️</div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">Semi-Automated Printing</h3>
              <p className="text-gray-600 font-light text-xs leading-snug">2-click approval and print process</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50/50 to-white rounded-xl shadow-sm hover:shadow-md p-4 transition-all duration-300 hover:-translate-y-1 border border-purple-100/50">
              <div className="text-2xl mb-2">💳</div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">UPI Payment Integration</h3>
              <p className="text-gray-600 font-light text-xs leading-snug">Simple UPI reference ID payment</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50/50 to-white rounded-xl shadow-sm hover:shadow-md p-4 transition-all duration-300 hover:-translate-y-1 border border-purple-100/50">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">Peak-Time Control</h3>
              <p className="text-gray-600 font-light text-xs leading-snug">Smart traffic management system</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50/50 to-white rounded-xl shadow-sm hover:shadow-md p-4 transition-all duration-300 hover:-translate-y-1 border border-purple-100/50">
              <div className="text-2xl mb-2">📱</div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">Real-Time Updates</h3>
              <p className="text-gray-600 font-light text-xs leading-snug">Live status via Socket.IO</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-6">
          <div className="text-center mb-3">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent mb-1">
              How It Works
            </h2>
            <p className="text-gray-500 text-xs font-light">Simple steps to get your documents printed</p>
          </div>
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-7 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-200 via-purple-300 to-purple-200"></div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 relative">
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md p-3 text-center transition-all duration-300 hover:-translate-y-1 border border-purple-100">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl flex items-center justify-center text-sm font-bold mx-auto mb-2 shadow-md">1</div>
                <h4 className="text-xs font-semibold text-gray-800 mb-1">Upload</h4>
                <p className="text-gray-500 text-[10px] font-light">Upload PDF/DOC</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md p-3 text-center transition-all duration-300 hover:-translate-y-1 border border-purple-100">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl flex items-center justify-center text-sm font-bold mx-auto mb-2 shadow-md">2</div>
                <h4 className="text-xs font-semibold text-gray-800 mb-1">Join Queue</h4>
                <p className="text-gray-500 text-[10px] font-light">Get token number</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md p-3 text-center transition-all duration-300 hover:-translate-y-1 border border-purple-100">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl flex items-center justify-center text-sm font-bold mx-auto mb-2 shadow-md">3</div>
                <h4 className="text-xs font-semibold text-gray-800 mb-1">Payment</h4>
                <p className="text-gray-500 text-[10px] font-light">Enter UPI ID</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md p-3 text-center transition-all duration-300 hover:-translate-y-1 border border-purple-100">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl flex items-center justify-center text-sm font-bold mx-auto mb-2 shadow-md">4</div>
                <h4 className="text-xs font-semibold text-gray-800 mb-1">Process</h4>
                <p className="text-gray-500 text-[10px] font-light">Vendor prints</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md p-3 text-center transition-all duration-300 hover:-translate-y-1 border border-purple-100">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl flex items-center justify-center text-sm font-bold mx-auto mb-2 shadow-md">5</div>
                <h4 className="text-xs font-semibold text-gray-800 mb-1">Pickup</h4>
                <p className="text-gray-500 text-[10px] font-light">Collect print</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="text-center py-6 bg-gradient-to-br from-purple-100/50 to-purple-200/50 rounded-2xl shadow-inner">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Ready to Experience Hassle-Free Printing?</h2>
          <p className="text-gray-600 text-xs mb-4 font-light">Join thousands of students already using PrintFlow</p>
          <Link 
            to="/student/login" 
            className="inline-block px-8 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full font-medium text-sm hover:shadow-lg hover:scale-105 transition-all duration-300 shadow-md"
          >
            Get Started Now
          </Link>
        </section>
      </div>
    </div>
  );
};

export default Landing;
