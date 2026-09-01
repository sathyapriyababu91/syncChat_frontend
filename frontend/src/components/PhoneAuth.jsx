import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Navigation added

const PhoneAuth = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Local Backend Server Base URL
  const API_BASE_URL = "http://localhost:5000/api";

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
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        textAlign: "center",
      }}
    >
      <h2>SyncChat Phone Login</h2>

      {/* Phone Input */}
      <input
        type="tel"
        placeholder="+919500446636"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        disabled={loading || otpSent}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          boxSizing: "border-box",
        }}
      />

      {/* Send OTP Button */}
      {!otpSent && (
        <button
          onClick={sendOTP}
          disabled={loading}
          style={{
            padding: "10px 20px",
            width: "100%",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>
      )}

      {/* OTP Input & Verify Button */}
      {otpSent && (
        <>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "15px",
              marginBottom: "10px",
              boxSizing: "border-box",
            }}
          />

          <button
            onClick={verifyOTP}
            disabled={loading}
            style={{
              padding: "10px 20px",
              width: "100%",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </>
      )}

      {message && (
        <p style={{ marginTop: "15px", fontWeight: "bold" }}>{message}</p>
      )}
    </div>
  );
};

export default PhoneAuth;