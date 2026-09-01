import { useEffect, useRef, useState } from "react";
import SideNav from "../components/SideNav";
import axios from "axios";

function StatusPage() {
  const [activeTab, setActiveTab] = useState("status");
  const [statuses, setStatuses] = useState([]);
  const [caption, setCaption] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  const currentUserId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // ==============================
  // FETCH STATUSES
  // ==============================

  const fetchStatuses = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/status/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStatuses(response.data.statuses || []);
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  // ==============================
  // UPLOAD STATUS
  // ==============================

  const handleUploadStatus = async (e) => {
    e.preventDefault();

    if (!mediaFile && !caption.trim()) {
      alert("Please select a media file or type a status.");
      return;
    }

    const formData = new FormData();

    formData.append("userId", currentUserId);
    formData.append("caption", caption.trim());

    if (mediaFile) {
      formData.append("media", mediaFile);
    }

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/status/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Status uploaded successfully!");

      setCaption("");
      setMediaFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await fetchStatuses();
    } catch (error) {
      console.error(
        "Error uploading status:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          "Failed to upload status"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // DELETE STATUS
  // ==============================

  const handleDeleteStatus = async (statusId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/status/delete/${statusId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Status deleted successfully!");

      setSelectedStatus(null);

      fetchStatuses();
    } catch (error) {
      console.error(
        "Error deleting status:",
        error.response?.data || error
      );

      alert("Failed to delete status");
    }
  };

  // ==============================
  // FILE SELECT
  // ==============================

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setMediaFile(null);
      return;
    }

    setMediaFile(file);
  };

  // ==============================
  // CHECK MEDIA TYPE
  // ==============================

  const isVideo = (url = "") => {
    return /\.(mp4|webm|ogg|mov|mkv)$/i.test(url);
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">

      {/* ==============================
          SIDE NAV
      ============================== */}

      <SideNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* ==============================
          LEFT STATUS PANEL
      ============================== */}

      <div className="w-full md:w-[390px] bg-white flex flex-col border-r border-gray-200">

        {/* HEADER */}

        <div className="px-6 py-5 border-b border-gray-200">

          <div className="flex items-center justify-between">

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Status
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Share moments with your contacts
              </p>
            </div>

            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xl shadow-md">
              ✨
            </div>

          </div>

        </div>

        {/* SCROLL CONTENT */}

        <div className="flex-1 overflow-y-auto p-5">

          {/* CREATE STATUS */}

          <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 p-5 shadow-sm">

            <div className="flex items-center gap-3 mb-5">

              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xl">
                +
              </div>

              <div>
                <h2 className="font-bold text-gray-800">
                  Create Status
                </h2>

                <p className="text-xs text-gray-500">
                  Share text, photo or video
                </p>
              </div>

            </div>

            <form
              onSubmit={handleUploadStatus}
              className="space-y-4"
            >

              {/* FILE */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add media
                </label>

                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-violet-300 rounded-xl p-4 cursor-pointer bg-white hover:bg-violet-50 transition">

                  <span className="text-2xl">
                    📷
                  </span>

                  <div className="text-center">

                    <p className="text-sm font-semibold text-violet-700">
                      Choose Photo / Video
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      Optional
                    </p>

                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                </label>

                {mediaFile && (
                  <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                    ✓ {mediaFile.name}
                  </div>
                )}

              </div>

              {/* CAPTION */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your message
                </label>

                <textarea
                  value={caption}
                  onChange={(e) =>
                    setCaption(e.target.value)
                  }
                  rows="4"
                  placeholder="What's on your mind?"
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none resize-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
                />

              </div>

              {/* POST BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.01] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Posting..."
                  : "Post Status"}
              </button>

            </form>

          </div>

          {/* RECENT UPDATES */}

          <div className="mt-7">

            <div className="flex items-center justify-between mb-3">

              <h3 className="text-sm font-bold text-gray-800">
                Recent Updates
              </h3>

              <span className="text-xs text-gray-400">
                {statuses.length} status
                {statuses.length !== 1 ? "es" : ""}
              </span>

            </div>

            {statuses.length === 0 ? (

              <div className="text-center py-12">

                <div className="text-5xl mb-3">
                  📭
                </div>

                <p className="text-sm font-medium text-gray-500">
                  No status updates
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Create your first status
                </p>

              </div>

            ) : (

              <div className="space-y-2">

                {statuses.map((status) => (

                  <div
                    key={status._id}
                    onClick={() =>
                      setSelectedStatus(status)
                    }
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
                      selectedStatus?._id === status._id
                        ? "bg-violet-50 border-violet-200"
                        : "hover:bg-gray-50 border-gray-100"
                    } border`}
                  >

                    {/* PROFILE */}

                    <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-br from-violet-500 to-indigo-500 flex-shrink-0">

                      <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">

                        {status.userId?.profilePic ? (

                          <img
                            src={`http://localhost:5000${status.userId.profilePic}`}
                            alt=""
                            className="w-full h-full object-cover"
                          />

                        ) : (

                          <span className="font-bold text-violet-600">
                            {status.userId?.name?.[0] ||
                              "U"}
                          </span>

                        )}

                      </div>

                    </div>

                    {/* DETAILS */}

                    <div className="min-w-0 flex-1">

                      <h4 className="font-semibold text-gray-800 truncate">
                        {status.userId?.name ||
                          "User"}
                      </h4>

                      <p className="text-xs text-gray-500 truncate mt-1">
                        {status.caption ||
                          "📷 Media Status"}
                      </p>

                    </div>

                    <span className="text-gray-300">
                      ›
                    </span>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

      </div>

      {/* ==============================
          RIGHT STATUS VIEWER
      ============================== */}

      <div className="hidden md:flex flex-1 relative items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">

        {selectedStatus ? (

          <div className="relative w-full h-full flex items-center justify-center p-8">

            {/* CLOSE */}

            <button
              onClick={() =>
                setSelectedStatus(null)
              }
              className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur"
            >
              ✕
            </button>

            {/* STATUS CARD */}

            <div className="relative w-full max-w-[520px] h-[82vh] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">

              {/* USER HEADER */}

              <div className="absolute top-0 left-0 right-0 z-10 p-5 bg-gradient-to-b from-black/80 to-transparent">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-full overflow-hidden bg-violet-600 flex items-center justify-center text-white font-bold">

                    {selectedStatus.userId?.profilePic ? (

                      <img
                        src={`http://localhost:5000${selectedStatus.userId.profilePic}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />

                    ) : (

                      selectedStatus.userId?.name?.[0] ||
                      "U"

                    )}

                  </div>

                  <div>

                    <p className="text-white font-semibold">
                      {selectedStatus.userId?.name ||
                        "User"}
                    </p>

                    <p className="text-white/60 text-xs">
                      Status
                    </p>

                  </div>

                </div>

              </div>

              {/* MEDIA */}

              <div className="w-full h-full flex items-center justify-center">

                {selectedStatus.mediaUrl ? (

                  isVideo(
                    selectedStatus.mediaUrl
                  ) ? (

                    <video
                      src={`http://localhost:5000${selectedStatus.mediaUrl}`}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />

                  ) : (

                    <img
                      src={`http://localhost:5000${selectedStatus.mediaUrl}`}
                      alt="Status"
                      className="w-full h-full object-contain"
                    />

                  )

                ) : (

                  <div className="w-full h-full flex items-center justify-center p-10 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-800">

                    <p className="text-white text-3xl font-bold text-center leading-relaxed">
                      "{selectedStatus.caption}"
                    </p>

                  </div>

                )}

              </div>

              {/* CAPTION */}

              {selectedStatus.mediaUrl &&
                selectedStatus.caption && (

                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">

                    <p className="text-white text-center text-sm">
                      {selectedStatus.caption}
                    </p>

                  </div>

                )}

              {/* DELETE */}

              {String(
                selectedStatus.userId?._id
              ) === String(currentUserId) && (

                <button
                  onClick={() =>
                    handleDeleteStatus(
                      selectedStatus._id
                    )
                  }
                  className="absolute top-5 right-5 bg-red-600/90 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-semibold z-20"
                >
                  🗑 Delete
                </button>

              )}

            </div>

          </div>

        ) : (

          <div className="text-center">

            <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur mx-auto flex items-center justify-center text-5xl mb-6">
              👀
            </div>

            <h2 className="text-2xl font-bold text-white">
              View Status
            </h2>

            <p className="text-slate-400 mt-2">
              Select a status from the left
              to view it
            </p>

          </div>

        )}

      </div>

    </div>
  );
}

export default StatusPage;