import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PhoneAuth = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Local Backend Server Base URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Send OTP
  const sendOTP = async () => {
    if (!phone.trim()) {
      setMessage("Please enter your phone number");
      return;
    }

    const phoneNumber = phone.trim();

    // Indian number validation (+91)
    if (!/^\+91\d{10}$/.test(phoneNumber)) {
      setMessage("Please enter a valid Indian number like +919500446636");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await axios.post(`${API_BASE_URL}/otp/send`, {
        phone: phoneNumber,
      });

      console.log(response.data);

      setOtpSent(true);
      setMessage("OTP sent successfully to your mobile ✅");
    } catch (error) {
      console.error("OTP Send Error:", error);
      setMessage(
        error.response?.data?.message || "Failed to send OTP ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async () => {
    if (!otp.trim()) {
      setMessage("Please enter OTP");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await axios.post(`${API_BASE_URL}/otp/verify`, {
        phone: phone.trim(),
        otp: otp.trim(),
      });

      console.log(response.data);

      if (response.data.success) {
        setMessage("Phone number verified successfully ✅");

        // Save Auth Token & User data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Navigate to Home Page after 1 second
        setTimeout(() => {
          navigate("/home");
        }, 1000);
      }
    } catch (error) {
      console.error("OTP Verification Error:", error);
      setMessage(
        error.response?.data?.message || "Invalid or expired OTP ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">SyncChat Login</h2>
        <p className="text-xs text-gray-500 mb-6">Enter your mobile number to get started</p>

        {/* Phone Input */}
        <input
          type="tel"
          placeholder="+919500446636"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={loading || otpSent}
          className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 outline-none focus:ring-2 focus:ring-violet-500 text-sm mb-4 disabled:bg-gray-100"
        />

        {/* Send OTP Button */}
        {!otpSent ? (
          <button
            onClick={sendOTP}
            disabled={loading}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition disabled:opacity-50 text-sm shadow-sm"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        ) : (
          <div className="space-y-4">
            {/* OTP Input */}
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 outline-none focus:ring-2 focus:ring-violet-500 text-sm text-center tracking-widest font-bold"
            />

            {/* Verify Button */}
            <button
              onClick={verifyOTP}
              disabled={loading}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition disabled:opacity-50 text-sm shadow-sm"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            {/* Change Number Option */}
            <button
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setMessage("");
              }}
              className="text-xs text-violet-600 hover:underline font-medium block mx-auto"
            >
              Change Phone Number?
            </button>
          </div>
        )}

        {message && (
          <p className="mt-4 text-xs font-semibold text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
};

export default PhoneAuth;