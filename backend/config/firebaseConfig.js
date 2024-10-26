// backend/config/firebaseConfig.js
import { initializeApp } from 'firebase-admin/app';

const firebaseConfig = {
  apiKey: "AIzaSyAxtxBAZXRCUn9yIbUtUY15jJs1Dol6B84",
  authDomain: "wadii-891a7.firebaseapp.com",
  projectId: "wadii-891a7",
  storageBucket: "wadii-891a7.appspot.com",
  messagingSenderId: "751105736650",
  appId: "1:751105736650:web:6f2560c5ef25bf1aa41933"
};

const app = initializeApp(firebaseConfig);

export default app;