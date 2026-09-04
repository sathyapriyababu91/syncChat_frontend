import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendOTP = async () => {
    if (!phone.trim()) {
      setMessage("Please enter your phone number");
      return;
    }

    const phoneNumber = phone.trim();

    if (!/^\+91\d{10}$/.test(phoneNumber)) {
      setMessage(
        "Please enter a valid Indian number like +919876543210"
      );
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await api.post("/otp/send", {
        phone: phoneNumber,
      });

      console.log("Register Send OTP:", res.data);
      setOtpSent(true);
      setMessage("OTP sent successfully ✅");
    } catch (error) {
      console.error(
        "OTP Send Error:",
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message ||
          "Failed to send OTP ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setMessage("Please enter OTP");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await api.post("/otp/verify", {
        phone: phone.trim(),
        otp: otp.trim(),
      });

      console.log("Register Verify OTP:", res.data);

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.user._id);
        localStorage.setItem("userName", res.data.user.name || "");
        localStorage.setItem("phone", res.data.user.phone);

        setMessage("Phone number verified successfully ✅");
        navigate("/home");
      }
    } catch (error) {
      console.error(
        "OTP Verification Error:",
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message ||
          "Invalid or expired OTP ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-green-600 mb-6">
          SyncChat Register
        </h1>

        <h2 className="text-xl font-semibold text-center mb-6">
          Enter your phone number
        </h2>

        <div className="space-y-4">
          <input
            type="tel"
            placeholder="+919876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={otpSent || loading}
            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-green-500"
          />

          {!otpSent && (
            <button
              type="button"
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          )}

          {otpSent && (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-green-500"
              />

              <button
                type="button"
                onClick={handleVerifyOTP}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </>
          )}

          {message && (
            <p className="text-center text-sm font-medium text-gray-700">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;