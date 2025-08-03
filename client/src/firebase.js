// client/src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyB7AObMfj08lW4eSWFTg4KmGwpaMSpKw1E",
  authDomain: "smart-parking-b521d.firebaseapp.com",
  projectId: "smart-parking-b521d",
  storageBucket: "smart-parking-b521d.firebasestorage.app",
  messagingSenderId: "676712357356",
  appId: "1:676712357356:web:f1dfad6311c416f85c74c9",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const functions = getFunctions(app, "asia-south1");

export { app, functions };
