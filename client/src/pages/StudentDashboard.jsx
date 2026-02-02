import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import api from "../utils/api";

const StudentDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    file: null,
    fileName: "",
    pageCount: "",
    printType: "black-white",
    copies: 1,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (
        file.type !== "application/pdf" &&
        !file.name.endsWith(".doc") &&
        !file.name.endsWith(".docx")
      ) {
        setError("Please upload PDF or DOC files only");
        return;
      }
      setFormData({ ...formData, file, fileName: file.name });
      setError("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("dragover");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (file) {
      if (
        file.type !== "application/pdf" &&
        !file.name.endsWith(".doc") &&
        !file.name.endsWith(".docx")
      ) {
        setError("Please upload PDF or DOC files only");
        return;
      }
      setFormData({ ...formData, file, fileName: file.name });
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      setError("Please select a file");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", formData.file);
      uploadFormData.append("pageCount", formData.pageCount);
      uploadFormData.append("printType", formData.printType);
      uploadFormData.append("copies", formData.copies);

      const response = await api.post("/api/student/upload", uploadFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/student/queue", { state: { jobId: response.data.jobId } });
    } catch (err) {
      setError(
        err.response?.data?.message || "Upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">
            Welcome, {user?.name}!
          </h1>
          <p className="text-lg text-purple-700">
            Upload your document and join the virtual queue
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-purple-900 mb-6">
            📤 Upload Document
          </h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div
              className="border-2 border-dashed border-purple-300 rounded-xl p-12 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all mb-6"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-6xl mb-4">📄</div>
              <p className="text-lg font-semibold text-gray-700 mb-2">
                {formData.fileName || "Click or drag file here to upload"}
              </p>
              <p className="text-sm text-gray-500">
                PDF or DOC files only (Max 10MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>

            {formData.fileName && (
              <div className="flex items-center justify-between bg-purple-100 px-4 py-3 rounded-lg mb-6">
                <span className="text-purple-900 font-medium">
                  📎 {formData.fileName}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, file: null, fileName: "" })
                  }
                  className="text-red-600 hover:text-red-800 font-bold text-xl"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Page Count
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.pageCount}
                  onChange={(e) =>
                    setFormData({ ...formData, pageCount: e.target.value })
                  }
                  required
                  placeholder="Number of pages"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Print Type
                </label>
                <select
                  value={formData.printType}
                  onChange={(e) =>
                    setFormData({ ...formData, printType: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="black-white">Black & White</option>
                  <option value="color">Color</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Copies
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.copies}
                  onChange={(e) =>
                    setFormData({ ...formData, copies: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploading || !formData.file}
            >
              {uploading ? "Uploading..." : "📤 Upload & Join Queue"}
            </button>
          </form>
        </div>

        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl shadow-lg p-6 border-l-4 border-purple-600">
          <h3 className="text-xl font-bold text-purple-900 mb-2">💡 Pro Tip</h3>
          <p className="text-gray-700">
            Upload your documents <strong>before break time</strong> to avoid
            peak-hour congestion. During break, you'll only need to join the
            queue and pick up your prints!
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
