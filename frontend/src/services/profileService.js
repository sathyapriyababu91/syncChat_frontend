import api from "./api";

export const getProfile = async () => {
  const response = await api.get("/api/users/profile");
  return response.data;
};

export const updateProfile = async (formData) => {
  const response = await api.put("/api/users/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};