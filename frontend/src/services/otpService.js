import { auth } from "../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import api from "./api";

// 1. Send OTP using Firebase Phone Auth (Sends real SMS directly to mobile)
export const sendOTP = async (phone) => {
  try {
    // Setup reCAPTCHA verifier if not already present
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: (response) => {
          // reCAPTCHA solved
        },
      });
    }

    const appVerifier = window.recaptchaVerifier;
    const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;

    // Firebase built-in function to trigger real SMS OTP
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
    
    // Store confirmationResult globally so we can use it during verification
    window.confirmationResult = confirmationResult;

    return { success: true, message: "OTP sent successfully to your mobile!" };
  } catch (error) {
    console.error("Firebase sendOTP error:", error);
    throw new Error(error.message || "Failed to send OTP");
  }
};

// 2. Verify OTP using Firebase & Sync with Backend MongoDB
export const verifyOTP = async (phone, otp) => {
  try {
    const confirmationResult = window.confirmationResult;
    if (!confirmationResult) {
      throw new Error("OTP request expired or not initiated. Please request a new OTP.");
    }

    // Confirm the OTP code with Firebase
    const result = await confirmationResult.confirm(otp);
    const verifiedPhone = result.user.phoneNumber;

    // Send the verified phone number to your Node.js Backend to create/login user and generate JWT
    const res = await api.post("/api/users/firebase-login", { phone: verifiedPhone });
    return res.data;
    
  } catch (error) {
    console.error("Firebase verifyOTP error:", error);
    throw new Error(error.message || "Invalid or expired OTP");
  }
};