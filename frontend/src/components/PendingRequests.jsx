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

      alert(data.message);

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

      alert(data.message);

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
      <p className="text-center text-gray-500 text-sm p-4">
        Loading requests...
      </p>
    );
  }

  if (requests.length === 0) {
    return (
      <p className="text-center text-gray-500 text-sm p-4">
        No friend requests
      </p>
    );
  }

  return (
    <div className="p-4">
      <h2 className="font-bold text-lg mb-4">
        Friend Requests
      </h2>

      <div className="space-y-3">
        {requests.map((request) => {
          const user = request.sender;

          return (
            <div
              key={request._id}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border"
            >
              {/* Profile */}
              <div className="w-11 h-11 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold">
                {user?.profilePic ? (
                  <img
                    src={`http://localhost:5000${user.profilePic}`}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>

              {/* User details */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {user?.name}
                </p>

                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleAccept(request._id)}
                  className="px-3 py-2 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600"
                >
                  Accept
                </button>

                <button
                  onClick={() => handleReject(request._id)}
                  className="px-3 py-2 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600"
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