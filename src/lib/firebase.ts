import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCnYfY83kaesvJGQytLCkOkfJ5Aq2vTcpo",
  authDomain: "web-app23.firebaseapp.com",
  projectId: "web-app23",
  storageBucket: "web-app23.firebasestorage.app",
  messagingSenderId: "677226463295",
  appId: "1:677226463295:web:971f429938078492f1b88a",
  measurementId: "G-700EBQE1JZ"
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-042749b5-2650-4323-9388-bad2fe91f276");
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);

export default app;
