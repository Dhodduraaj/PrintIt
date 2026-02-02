import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12 bg-gradient-to-br from-[#E9D5FF] to-[#F3E8FF] rounded-2xl p-8 shadow-sm">
          <h1 className="text-4xl md:text-5xl font-bold text-[#7A2FBF] mb-4">
            PrintFlow
          </h1>
          <p className="text-xl md:text-2xl text-[#4B157A] mb-3 font-medium">
            Digital Queue System for College Printing
          </p>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            PrintFlow is a web-based platform that eliminates long queues at
            college print shops. Students can upload documents from anywhere,
            join a virtual queue, and track their printing status in
            real-time—no more waiting in crowded shops during breaks.
          </p>
        </section>

        {/* Problem Section */}
        <section className="mb-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-[#7A2FBF] mb-2">
              The Problem We Solve
            </h2>
            <p className="text-[#9B4DFF] text-base">
              Why college printing needs a better solution
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#7A2FBF]">
              <h3 className="text-xl font-bold text-[#4B157A] mb-4">
                For Students
              </h3>
              <ul className="space-y-3 text-[#4B157A]">
                <li className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">•</span>
                  <span className="text-base">
                    Spend 15-30 minutes standing in queues during short breaks
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">•</span>
                  <span className="text-base">
                    Miss classes or lunch time waiting for prints
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">•</span>
                  <span className="text-base">
                    No way to know how long the wait will be
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">•</span>
                  <span className="text-base">
                    Physical crowding and chaos at the print shop
                  </span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#9B4DFF]">
              <h3 className="text-xl font-bold text-[#4B157A] mb-4">
                For Print Shop Vendors
              </h3>
              <ul className="space-y-3 text-[#4B157A]">
                <li className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">•</span>
                  <span className="text-base">
                    Sudden rush of students during break times
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">•</span>
                  <span className="text-base">
                    Difficult to manage multiple print requests at once
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">•</span>
                  <span className="text-base">
                    Students repeatedly asking "How long will it take?"
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">•</span>
                  <span className="text-base">
                    Hard to keep track of who paid and who didn't
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="mb-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-[#7A2FBF] mb-2">
              How PrintFlow Works
            </h2>
            <p className="text-[#9B4DFF] text-base">
              A simple digital solution for both students and vendors
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#C38BFF]/10 to-white rounded-xl shadow-lg p-6 mb-6 border border-[#7A2FBF]/20">
            <h3 className="text-xl font-bold text-[#4B157A] mb-4 text-center">
              For Students
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl mb-2">1️⃣</div>
                <h4 className="font-bold text-[#4B157A] mb-2">
                  Upload Document
                </h4>
                <p className="text-sm text-gray-600">
                  Upload your PDF or Word document from anywhere—your dorm,
                  library, or classroom
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">2️⃣</div>
                <h4 className="font-bold text-[#4B157A] mb-2">
                  Join Virtual Queue
                </h4>
                <p className="text-sm text-gray-600">
                  Get a queue number and see your position in real-time. Know
                  exactly when to arrive
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">3️⃣</div>
                <h4 className="font-bold text-[#4B157A] mb-2">Pay & Collect</h4>
                <p className="text-sm text-gray-600">
                  Pay via UPI when ready. Arrive at the shop when your turn
                  comes and collect your prints
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#9B4DFF]/10 to-white rounded-xl shadow-lg p-6 border border-[#9B4DFF]/20">
            <h3 className="text-xl font-bold text-[#4B157A] mb-4 text-center">
              For Vendors
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl mb-2">📋</div>
                <h4 className="font-bold text-[#4B157A] mb-2">
                  See All Requests
                </h4>
                <p className="text-sm text-gray-600">
                  View all pending print jobs in one dashboard with all details
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">✅</div>
                <h4 className="font-bold text-[#4B157A] mb-2">
                  Process Orders
                </h4>
                <p className="text-sm text-gray-600">
                  Accept jobs, verify payment, and print—all tracked digitally
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📊</div>
                <h4 className="font-bold text-[#4B157A] mb-2">Manage Queue</h4>
                <p className="text-sm text-gray-600">
                  Students see live updates. No more answering "How long?"
                  repeatedly
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-[#7A2FBF] mb-2">
              Key Features
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
              <h3 className="text-lg font-bold text-[#4B157A] mb-2">
                Virtual Queue System
              </h3>
              <p className="text-gray-600 text-sm">
                No physical waiting. Join the queue digitally and track your
                position from anywhere
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
              <h3 className="text-lg font-bold text-[#4B157A] mb-2">
                Real-Time Updates
              </h3>
              <p className="text-gray-600 text-sm">
                Instant notifications when your print job moves forward in the
                queue
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
              <h3 className="text-lg font-bold text-[#4B157A] mb-2">
                UPI Payment Integration
              </h3>
              <p className="text-gray-600 text-sm">
                Pay digitally with any UPI app. No need for exact change
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
              <h3 className="text-lg font-bold text-[#4B157A] mb-2">
                Upload Anytime
              </h3>
              <p className="text-gray-600 text-sm">
                Upload documents before break time and join the queue early
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
              <h3 className="text-lg font-bold text-[#4B157A] mb-2">
                Vendor Dashboard
              </h3>
              <p className="text-gray-600 text-sm">
                Easy-to-use interface for vendors to manage all print requests
                efficiently
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
              <h3 className="text-lg font-bold text-[#4B157A] mb-2">
                Admin Controls
              </h3>
              <p className="text-gray-600 text-sm">
                Manage users, vendors, and monitor the entire system from one
                place
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-10 bg-gradient-to-r from-[#7A2FBF] to-[#9B4DFF] rounded-2xl shadow-xl text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Ready to Skip the Queue?
          </h2>
          <p className="text-base mb-6 max-w-2xl mx-auto">
            Join PrintFlow today and experience stress-free printing at your
            college
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/student/login"
              className="inline-block px-8 py-3 bg-white text-[#7A2FBF] rounded-xl font-bold text-base hover:bg-[#C38BFF] hover:text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-xl"
            >
              Student Login
            </Link>
            <Link
              to="/vendor/login"
              className="inline-block px-8 py-3 bg-white text-[#7A2FBF] rounded-xl font-bold text-base hover:bg-[#C38BFF] hover:text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-xl"
            >
              Vendor Login
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Landing;
