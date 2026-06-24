import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDV9uQ5EuXrfyupHgujq_suNqFDRYT1RZk",
  authDomain: "mayck-eduardo.firebaseapp.com",
  projectId: "mayck-eduardo",
  storageBucket: "mayck-eduardo.firebasestorage.app",
  messagingSenderId: "562071861920",
  appId: "1:562071861920:web:a4e212b33cc937022927c5",
  measurementId: "G-S3XMZJ5C8B"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
