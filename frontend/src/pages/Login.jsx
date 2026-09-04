import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendOTP, verifyOTP } from "../services/otpService"; 

function Login() {
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

      // Using otpService which includes /api prefix safely
      const data = await sendOTP(phoneNumber);

      console.log("Send OTP response:", data);
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

      // Using verifyOTP service
      const data = await verifyOTP(phone.trim(), otp.trim());

      console.log("OTP Verify response:", data);

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("userName", data.user.name || "");
        localStorage.setItem("phone", data.user.phone);

        setMessage("Login successful ✅");
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
          SyncChat Login
        </h1>

        <h2 className="text-xl font-semibold text-center mb-6">
          Enter your phone number
        </h2>

        <div className="space-y-4">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+919876543210"
            disabled={otpSent || loading}
            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-green-500"
          />

          {!otpSent && (
            <button
              type="button"
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          )}

          {otpSent && (
            <>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                maxLength={6}
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-green-500"
              />

              <button
                type="button"
                onClick={handleVerifyOTP}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </>
          )}

          {message && (
            <p className="text-center text-sm">
              {message}
            </p>
          )}
        </div>

        <p className="text-center mt-5">
          New to SyncChat?{" "}
          <Link
            to="/register"
            className="text-green-600 font-semibold"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;