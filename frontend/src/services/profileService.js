import axios from "axios";

const API = "http://localhost:5000/api/users/profile";

const getToken = () => {
  return localStorage.getItem("token");
};

export const getProfile = async () => {
  const response = await axios.get(API, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return response.data;
};

export const updateProfile = async (formData) => {
  const response = await axios.put(API, formData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};