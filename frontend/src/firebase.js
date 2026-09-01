import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA8Ywb_TUGWdOPYs3OSRTeKFZp5gZJIr-A",
  authDomain: "syncchat-3febc.firebaseapp.com",
  projectId: "syncchat-3febc",
  storageBucket: "syncchat-3febc.firebasestorage.app",
  messagingSenderId: "714044151304",
  appId: "1:714044151304:web:b750f2a3195b2c2647e3bd",
   measurementId: "G-WSNTFML96P"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);