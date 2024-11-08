//Ryan Stuff
// src/services/firebase.js
import { initializeApp } from 'firebase/app'; // Correct import for Firebase 9+
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'; // Import Firebase Auth
import { getFirestore } from 'firebase/firestore'; // Import Firestore (if needed)
import { getStorage } from "firebase/storage"; // Import getStorage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHb-fBzzoIx6kv-WyAo8Q7ZLwzlVq6jTc",
  authDomain: "healthychef-a4655.firebaseapp.com",
  projectId: "healthychef-a4655",
  storageBucket: "healthychef-a4655.firebasestorage.app",
  messagingSenderId: "1030137873458",
  appId: "1:1030137873458:web:fb757968eac65d00e5e82b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you need
const auth = getAuth(app);
const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

const storage = getStorage(app); // Initialize storage

export { auth, db, storage, googleProvider, signInWithPopup };
