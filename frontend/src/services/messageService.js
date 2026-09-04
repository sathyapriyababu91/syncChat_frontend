import api from "./api";

// GET MESSAGES
export const getMessages = async (userId) => {
  const res = await api.get(`/api/message/${userId}`);
  return res.data;
};

// GET UNREAD MESSAGES COUNT
export const getUnreadCount = async () => {
  const res = await api.get("/api/message/unread/count");
  return res.data;
};

// MARK MESSAGES AS READ
export const markMessagesAsRead = async (senderId) => {
  const res = await api.put(`/api/message/mark-read/${senderId}`);
  return res.data;
};

// SEND MESSAGE
export const sendMessage = async (receiverId, message) => {
  const res = await api.post("/api/message/send", { receiverId, message });
  return res.data;
};

// GET CALL HISTORY
export const getCallHistory = async () => {
  const res = await api.get("/api/message/call-history");
  return res.data;
};

// SAVE CALL HISTORY
export const saveCallHistory = async (receiverId, callType, status, duration) => {
  const res = await api.post("/api/message/call-history", {
    receiverId,
    callType,
    status,
    duration,
  });
  return res.data;
};