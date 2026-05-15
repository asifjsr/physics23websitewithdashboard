import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from './lib/firebase';

async function testConnection() {
  console.log("DIAGNOSTIC: Testing Firestore connection for project 'web-app23'...");
  try {
    // Try to reach the server directly to test connectivity
    await getDocFromServer(doc(db, 'system', 'connection-test'));
    console.log("Firestore connection test: SUCCESS. Server is reachable.");
  } catch (error: any) {
    console.error("Firestore connection test: FAILED.", error.message || error);
    if (error.message?.includes('offline') || error.code === 'unavailable') {
      console.error("FATAL: Firestore is offline or unreachable. " +
        "1. Ensure Firestore is enabled in Firebase Console for project 'web-app23'. " +
        "2. Add your current URL to 'Authorized domains' in Authentication settings. " +
        "3. Check your internet connection.");
    } else if (error.code === 'permission-denied') {
      console.log("Firestore connection test: Server is reachable, but access was denied (this is expected for protected paths).");
    }
  }
}

testConnection();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
