import api from "./api";

export const searchUsers = async (keyword) => {
  const res = await api.get(`/users/search?name=${keyword}`);
  return res.data;
};
export const changePassword = async (currentPassword, newPassword) => {
  const res = await api.put("/users/change-password", {
    currentPassword,
    newPassword,
  });
  return res.data;
};