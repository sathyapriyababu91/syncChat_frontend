import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("+91");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!phone.trim() || phone === "+91") {
      setMessage("Please enter your phone number ❌");
      return;
    }

    const phoneNumber = phone.trim();
    if (!/^\+91\d{10}$/.test(phoneNumber)) {
      setMessage("Please enter a valid Indian number like +919876543210 ❌");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      // Live Backend URL மாற்றப்பட்டுள்ளது
      const response = await axios.post("https://syncchat-rfzq.onrender.com/api/users/phone-login", {
        phone: phoneNumber,
        name: name.trim(),
      });

      const data = response.data;

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("userName", data.user.name || "");
        localStorage.setItem("phone", data.user.phone);

        setMessage("Login successful ✅");
        navigate("/home");
      }
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      setMessage(
        error.response?.data?.message || error.message || "Login failed ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-violet-600 mb-6">
          SyncChat Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                const val = e.target.value;
                if (val.startsWith("+91")) {
                  setPhone(val);
                } else {
                  setPhone("+91" + val.replace(/^\+91/, ""));
                }
              }}
              placeholder="+919876543210"
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name (Required if new user)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-violet-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 text-white py-3 rounded-lg hover:bg-violet-700 font-semibold transition"
          >
            {loading ? "Logging in..." : "Login / Register"}
          </button>

          {message && (
            <p className="text-center text-sm font-medium text-gray-700 mt-2">
              {message}
            </p>
          )}
        </form>

        <p className="text-center mt-5 text-sm text-gray-600">
          New to SyncChat?{" "}
          <Link to="/register" className="text-violet-600 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;