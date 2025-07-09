import { initializeApp } from "firebase/app";
import { initializeAuth, Auth, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFunctions, httpsCallable } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

let auth: Auth;
try {
  const { getReactNativePersistence } = require("firebase/auth/react-native");
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  auth = getAuth(app);
  console.warn("Firebase persistence not enabled:", error);
}

const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export const callCreateSuperAdmin = httpsCallable(functions, "createSuperAdmin");

export type AppUser = {
  uid: string;
  email: string | null;
  displayName?: string | null;
  phoneNumber?: string | null;
  role?: "user" | "employee" | "admin";
  serviceRadius?: number;
  fcmToken?: string;
};

export { app, auth, db, storage, functions };