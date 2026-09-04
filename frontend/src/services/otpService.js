import api from "./api";

export const sendOTP = async (phone) => {
  const res = await api.post("/api/otp/send", {
    phone,
  });
  return res.data;
};

export const verifyOTP = async (phone, otp) => {
  const res = await api.post("/api/otp/verify", {
    phone,
    otp,
  });
  return res.data;
};