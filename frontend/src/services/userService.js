import api from "./api";

export const searchUsers = async (keyword) => {
  const res = await api.get("/search?name=" + keyword);
  return res.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const res = await api.put("/api/users/change-password", {
    currentPassword,
    newPassword,
  });
  return res.data;
};