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
      alert(data.message);
      loadRequests();
    } catch (error) {
      alert(error.response?.data?.message || "Failed");
    }
  };

  const handleReject = async (id) => {
    try {
      const data = await rejectRequest(id);
      alert(data.message);
      loadRequests();
    } catch (error) {
      alert(error.response?.data?.message || "Failed");
    }
  };

  return (
    <div>
      {requests.map((request) => (
        <div key={request._id}>
          <h3>{request.sender.name}</h3>
          <p>{request.sender.email}</p>

          <button onClick={() => handleAccept(request._id)}>
            Accept
          </button>

          <button onClick={() => handleReject(request._id)}>
            Reject
          </button>
        </div>
      ))}
    </div>
  );
}

export default PendingRequests;