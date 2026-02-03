import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/api";

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { selectVendor } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await api.get("/api/student/vendors");
        setVendors(res.data.vendors);
      } catch (err) {
        toast.error("Failed to fetch vendors");
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const handleSelectVendor = (vendor) => {
    selectVendor(vendor);
    navigate("/student/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent mb-3">
            Select Your Print Vendor
          </h1>
          <p className="text-gray-600 text-lg">
            Choose from <span className="font-semibold text-purple-700">{vendors.length}</span> available vendor{vendors.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Vendors Grid */}
        {vendors.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-purple-200 p-12 text-center">
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Vendors Available</h3>
            <p className="text-gray-500">Please check back later when vendors are online.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <div
                key={vendor._id}
                onClick={() => handleSelectVendor(vendor)}
                className="group bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-purple-200 p-6 cursor-pointer hover:shadow-2xl hover:border-purple-400 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                
                <div className="relative z-10">
                  {/* Header with status badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-800 group-hover:text-purple-700 transition-colors mb-1">
                        {vendor.name}
                      </h2>
                      <p className="text-sm text-gray-500">Print Services</p>
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                        vendor.isShopOpen
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-red-100 text-red-700 border border-red-300"
                      }`}
                    >
                      {vendor.isShopOpen ? "● Open" : "● Closed"}
                    </span>
                  </div>

                  {/* Vendor Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <span className="text-xl">📋</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Current Queue</p>
                        <p className="text-lg font-bold text-gray-800">
                          {vendor.queueSize} {vendor.queueSize === 1 ? 'job' : 'jobs'}
                        </p>
                      </div>
                    </div>
                    
                    {vendor.isShopOpen && (
                      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">
                        <span>✓</span>
                        <span className="font-medium">Accepting orders</span>
                      </div>
                    )}
                  </div>

                  {/* Select Button */}
                  <button 
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105"
                    disabled={!vendor.isShopOpen}
                  >
                    {vendor.isShopOpen ? 'Select Vendor' : 'Currently Closed'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-white/90 backdrop-blur-xl rounded-xl shadow-md border border-purple-200 px-6 py-4">
            <p className="text-sm text-gray-600">
              💡 <span className="font-semibold">Tip:</span> Choose vendors with shorter queues for faster service
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vendors;
