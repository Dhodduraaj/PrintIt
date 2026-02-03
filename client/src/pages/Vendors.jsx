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
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Select a Vendor</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <div
            key={vendor._id}
            onClick={() => handleSelectVendor(vendor)}
            className="bg-[#2E1A4D] border border-[#4B157A] rounded-xl p-6 cursor-pointer hover:border-purple-500 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">{vendor.name}</h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  vendor.isShopOpen
                    ? "bg-green-500/20 text-green-400 border border-green-500/50"
                    : "bg-red-500/20 text-red-400 border border-red-500/50"
                }`}
              >
                {vendor.isShopOpen ? "Open" : "Closed"}
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-gray-400 flex items-center gap-2">
                <span className="text-purple-400">📋</span>
                Queue Size: <span className="text-white font-medium">{vendor.queueSize} jobs</span>
              </p>
            </div>
            <button className="w-full mt-6 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
              Select Vendor
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Vendors;
