import api from "./api";

// Get My Contacts
export const getContacts = async () => {
  const res = await api.get("/contacts"); 
  return res.data;
};

// Send Friend Request
export const sendRequest = async (receiverId) => {
  const res = await api.post("/contact/request", {
    receiverId,
  });
  return res.data;
};

// Alias export for sendRequest (Search.jsx integration)
export const sendContactRequest = sendRequest;

// Get Pending Requests
export const getPendingRequests = async () => {
  const res = await api.get("/contact/pending");
  return res.data;
};

// Accept Friend Request
export const acceptRequest = async (requestId) => {
  const res = await api.put("/contact/accept", {
    requestId,
  });
  return res.data;
};

// Reject Friend Request
export const rejectRequest = async (requestId) => {
  const res = await api.put("/contact/reject", {
    requestId,
  });
  return res.data;
};

// Remove Contact
export const removeContact = async (contactUserId) => {
  const res = await api.delete("/contact/remove", {
    data: {
      contactUserId,
    },
  });
  return res.data;
};