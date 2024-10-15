import { createApp } from 'vue'
import App from './App.vue'
import router from "./router"
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBg4ZKf4hYPsG6X1hdm7_p-D6iG-rnYRDs",
  authDomain: "wad2-testing-v2.firebaseapp.com",
  projectId: "wad2-testing-v2",
  storageBucket: "wad2-testing-v2.appspot.com",
  messagingSenderId: "891321867847",
  appId: "1:891321867847:web:b407e816c8d12153159b62"
};

// Initialize Firebase
initializeApp(firebaseConfig);
const app = createApp(App)

app.use(router)

app.mount('#app')