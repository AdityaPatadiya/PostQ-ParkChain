// client/src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "add_yours",
  authDomain: "add_yours",
  projectId: "add_yours",
  storageBucket: "add_yours",
  messagingSenderId: "add_yours",
  appId: "add_yours",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const functions = getFunctions(app, "asia-south1");

export { app, functions };
