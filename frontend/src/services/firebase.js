// src/services/firebase.js
import { initializeApp } from 'firebase/app'; // Correct import for Firebase 9+
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'; // Import Firebase Auth
import { getFirestore } from 'firebase/firestore'; // Import Firestore (if needed)

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBg4ZKf4hYPsG6X1hdm7_p-D6iG-rnYRDs",
  authDomain: "wad2-testing-v2.firebaseapp.com",
  projectId: "wad2-testing-v2",
  storageBucket: "wad2-testing-v2.appspot.com",
  messagingSenderId: "891321867847",
  appId: "1:891321867847:web:a3f06d7a2c60002d159b62"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you need
const auth = getAuth(app);
const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider, signInWithPopup };
