import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "sociacube.firebaseapp.com",
  projectId: "sociacube",
  storageBucket: "sociacube.appspot.com",
  messagingSenderId: "129358505674",
  appId: "1:129358505674:web:8fd422e36b13a5ca773633",
  measurementId: "G-QWXQF5T4WZ"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
