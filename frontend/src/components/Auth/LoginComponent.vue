<template>
  <div class="container">
    <h2>Login</h2>
    <form @submit.prevent="loginWithEmail">
      <div class="form-group">
        <input
          type="email"
          v-model="email"
          placeholder="Email"
          class="form-control"
          required
          aria-label="Email"
        />
      </div>
      <div class="form-group">
        <input
          type="password"
          v-model="password"
          placeholder="Password"
          class="form-control"
          required
          aria-label="Password"
        />
      </div>
      <button type="submit" class="btn btn-primary">Login</button>
    </form>
    <button @click="loginWithGoogle" class="btn btn-danger mt-3">
      Login with Google
    </button>
    <p>Don't have an account? <router-link to="/register">Register</router-link></p>
  </div>
</template>

<script>
import { auth, db, googleProvider, signInWithPopup } from '../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default {
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '',
    };
  },
  methods: {
    async loginWithEmail() {
      try {
        await signInWithEmailAndPassword(auth, this.email, this.password);
        this.$router.push('/'); 
      } catch (error) {
        this.errorMessage = 'Login failed: ' + error.message; 
        console.error(this.errorMessage);
      }
    },
    async loginWithGoogle() {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user already exists in Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          // Save user profile in Firestore if it doesn't exist
          await setDoc(doc(db, 'users', user.uid), {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            uid: user.uid,
            dietaryPreferences: [], // Initialize as empty array
            notifications: false, // Default notification preference
            createdAt: new Date(), // Add createdAt field
            updatedAt: new Date(), // Add updatedAt field
          });
          console.log('User profile saved to Firestore');
        }

        this.$router.push('/'); 
      } catch (error) {
        console.error('Google Sign-In error', error);
      }
    },
  },
};
</script>
