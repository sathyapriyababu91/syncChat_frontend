import { useEffect, useState } from "react";
import {
  getPendingRequests,
  acceptRequest,
  rejectRequest,
} from "../services/contactService";

function PendingRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await getPendingRequests();
      setRequests(data.requests || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAccept = async (id) => {
    try {
      const data = await acceptRequest(id);
      alert(data.message || "Request accepted successfully");
      loadRequests();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to accept");
    }
  };

  const handleReject = async (id) => {
    try {
      const data = await rejectRequest(id);
      alert(data.message || "Request rejected successfully");
      loadRequests();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reject");
    }
  };

  return (
    <div className="p-4">
      {requests.length === 0 ? (
        <p className="text-gray-500 text-center">No pending requests</p>
      ) : (
        requests.map((request) => (
          <div key={request._id} className="bg-white p-4 rounded-lg shadow mb-3 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">{request.sender?.name || "Unknown User"}</h3>
              <p className="text-sm text-gray-500">{request.sender?.email || request.sender?.phone || ""}</p>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => handleAccept(request._id)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
              >
                Accept
              </button>

              <button 
                onClick={() => handleReject(request._id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default PendingRequests;