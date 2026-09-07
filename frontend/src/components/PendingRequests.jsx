import { useEffect, useState } from "react";
import {
  getPendingRequests,
  acceptRequest,
  rejectRequest,
} from "../services/contactService";

function PendingRequests({ onRequestAccepted }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getPendingRequests();
      setRequests(data.requests || []);
    } catch (error) {
      console.log("Failed to load pending requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAccept = async (requestId) => {
    try {
      const data = await acceptRequest(requestId);
      alert(data.message || "Friend request accepted!");

      // Remove request from pending list
      setRequests((prev) =>
        prev.filter((request) => request._id !== requestId)
      );

      // Refresh contacts in Home
      if (onRequestAccepted) {
        onRequestAccepted();
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to accept request"
      );
    }
  };

  const handleReject = async (requestId) => {
    try {
      const data = await rejectRequest(requestId);
      alert(data.message || "Friend request rejected!");

      setRequests((prev) =>
        prev.filter((request) => request._id !== requestId)
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to reject request"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-gray-400 text-xs font-medium animate-pulse">Loading requests...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <div className="w-12 h-12 bg-violet-50 text-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-2 text-xl">✨</div>
        <p className="text-gray-500 text-xs font-medium">No pending friend requests</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white/60 backdrop-blur-md rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-sm text-gray-800 flex items-center gap-2">
          <span>🤝</span> Friend Requests
        </h2>
        <span className="bg-violet-100 text-violet-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
          {requests.length}
        </span>
      </div>

      <div className="space-y-2.5">
        {requests.map((request) => {
          const user = request.sender;

          return (
            <div
              key={request._id}
              className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-gray-100 hover:border-violet-100 shadow-xs transition"
            >
              {/* Profile */}
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold overflow-hidden shrink-0 shadow-md shadow-violet-500/15">
                {user?.profilePic ? (
                  <img
                    src={`http://localhost:5000${user.profilePic}`}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>

              {/* User details */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs truncate text-gray-800">
                  {user?.name}
                </p>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">
                  {user?.email}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => handleAccept(request._id)}
                  className="px-3 py-1.5 bg-emerald-500 text-white text-[11px] font-semibold rounded-xl hover:bg-emerald-600 shadow-sm shadow-emerald-500/20 transition"
                >
                  Accept
                </button>

                <button
                  onClick={() => handleReject(request._id)}
                  className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white text-[11px] font-semibold rounded-xl transition"
                >
                  Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PendingRequests;