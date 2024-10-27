// backend/config/firebaseConfig.js
import { initializeApp } from 'firebase-admin/app';
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAxtxBAZXRCUn9yIbUtUY15jJs1Dol6B84",
  authDomain: "wadii-891a7.firebaseapp.com",
  projectId: "wadii-891a7",
  storageBucket: "wadii-891a7.appspot.com",
  messagingSenderId: "751105736650",
  appId: "1:751105736650:web:6f2560c5ef25bf1aa41933"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = getMessaging(app);

// // Function to get the FCM token
// export const requestPermission = async () => {
//   try {
//     const token = await getToken(messaging, { vapidKey: 'BP9JIi6vWavB06RrI5dGp3HfgOQHSvcvi9m5tlMNNhkxLzYv7UDkafVpKc8WkH6BT2E3jPweN-M3FWTMEOir8_U' });
//     console.log('FCM Token:', token);
//     return token;
//   } catch (error) {
//     console.error('Error getting FCM token:', error);
//   }
// };

// // Listen for messages
// export const listenForMessages = () => {
//   onMessage(messaging, (payload) => {
//     console.log('Message received. ', payload);
//     // Customize how to handle the message received
//     alert(`Message: ${payload.notification.title}\n${payload.notification.body}`);
//   });
// };

export default app;