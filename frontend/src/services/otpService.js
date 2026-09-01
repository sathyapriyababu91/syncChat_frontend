import api from "./api";

export const sendOTP = async (phone) => {
  const res = await api.post("/otp/send", {
    phone,
  });
  return res.data;
};

export const verifyOTP = async (phone, otp) => {
  const res = await api.post("/otp/verify", {
    phone,
    otp,
  });
  return res.data;
};