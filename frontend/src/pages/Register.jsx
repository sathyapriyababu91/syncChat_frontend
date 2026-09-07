import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendOTP, verifyOTP } from "../services/otpService"; 

function Register() {
  const navigate = useNavigate();

  // 🌟 Default-ah +91 set panrom
  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendOTP = async () => {
    if (!phone.trim() || phone === "+91") {
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

      // 🌟 Firebase sendOTP function call aagum
      const data = await sendOTP(phoneNumber);

      console.log("Register Send OTP:", data);
      setOtpSent(true);
      setMessage("OTP sent successfully to your mobile ✅");
    } catch (error) {
      console.error(
        "OTP Send Error:",
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message ||
          error.message ||
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

      // 🌟 Firebase verifyOTP & Backend MongoDB sync call aagum
      const data = await verifyOTP(phone.trim(), otp.trim());

      console.log("Register Verify OTP:", data);

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("userName", data.user.name || "");
        localStorage.setItem("phone", data.user.phone);

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
          error.message ||
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

        {/* 🌟 Firebase invisible reCAPTCHA container (Romba mukkiyam!) */}
        <div id="recaptcha-container"></div>

        <div className="space-y-4">
          <input
            type="tel"
            placeholder="+919876543210"
            value={phone}
            onChange={(e) => {
              // 🌟 User +91-ah delete panrathai thavirka
              const val = e.target.value;
              if (val.startsWith("+91")) {
                setPhone(val);
              } else {
                setPhone("+91" + val.replace(/^\+91/, ""));
              }
            }}
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
                placeholder="Enter 6-digit OTP"
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
            <p className="text-center text-sm font-medium text-gray-700 mt-2">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;