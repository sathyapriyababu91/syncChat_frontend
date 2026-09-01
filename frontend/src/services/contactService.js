import api from "./api";

// Get My Contacts
export const getContacts = async () => {
  const res = await api.get("/users/contacts");
  return res.data;
};

// Send Friend Request
export const sendRequest = async (receiverId) => {
  const res = await api.post("/users/contact/request", {
    receiverId,
  });
  return res.data;
};

// Alias export for sendRequest (Search.jsx integration)
export const sendContactRequest = sendRequest;

// Get Pending Requests
export const getPendingRequests = async () => {
  const res = await api.get("/users/contact/pending");
  return res.data;
};

// Accept Friend Request
export const acceptRequest = async (requestId) => {
  const res = await api.put("/users/contact/accept", {
    requestId,
  });
  return res.data;
};

// Reject Friend Request
export const rejectRequest = async (requestId) => {
  const res = await api.put("/users/contact/reject", {
    requestId,
  });
  return res.data;
};

// Remove Contact
export const removeContact = async (contactUserId) => {
  const res = await api.delete("/users/contact/remove", {
    data: {
      contactUserId,
    },
  });
  return res.data;
};