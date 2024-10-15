<template>
    <div class="auth">
      <h2 v-if="isRegistering">Register</h2>
      <h2 v-else>Login</h2>
  
      <form @submit.prevent="handleSubmit">
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Password" required />
        <button type="submit">{{ isRegistering ? 'Register' : 'Login' }}</button>
      </form>
  
      <button @click="toggleAuthMode">
        {{ isRegistering ? 'Already have an account? Login' : 'New user? Register' }}
      </button>
  
      <p v-if="errorMessage">{{ errorMessage }}</p>
    </div>
  </template>
  
  <script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
  apiKey: "AIzaSyBo0YjGSnSttOLPn9k3BwTL6YH01OOjva0",
  authDomain: "wad2-project-ff8f5.firebaseapp.com",
  projectId: "wad2-project-ff8f5",
  storageBucket: "wad2-project-ff8f5.appspot.com",
  messagingSenderId: "761693393506",
  appId: "1:761693393506:web:b8eabcf9655ea382a1773b"
};

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  import { ref } from 'vue';
  import { auth } from '@/firebase';
  import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
  
  export default {
    name: 'Auth',
    setup() {
      const email = ref('');
      const password = ref('');
      const isRegistering = ref(false);
      const errorMessage = ref('');
  
      const toggleAuthMode = () => {
        isRegistering.value = !isRegistering.value;
      };
  
      const handleSubmit = async () => {
        errorMessage.value = '';
        try {
          if (isRegistering.value) {
            // Register new user
            await createUserWithEmailAndPassword(auth, email.value, password.value);
          } else {
            // Login existing user
            await signInWithEmailAndPassword(auth, email.value, password.value);
          }
        } catch (error) {
          errorMessage.value = error.message;
        }
      };
  
      return { email, password, isRegistering, errorMessage, handleSubmit, toggleAuthMode };
    }
  };
  </script>
  
  <style scoped>
  .auth {
    /* Add your styles here */
    background-color: blue;
  }
  </style>
  
    
