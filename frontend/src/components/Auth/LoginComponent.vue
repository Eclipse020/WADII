<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="text-center">Login</h2>

      <!-- Email and Password Login Form -->
      <form @submit.prevent="loginWithEmail">
        <div class="form-group">
          <label for="email">Email: </label>
          <input
            type="email"
            v-model="email"
            placeholder="Email address"
            class="form-control"
            required
            aria-label="Email"
          />
        </div>

        <div class="form-group">
          <label for="password">Password: </label>
          <input
            type="password"
            v-model="password"
            placeholder="Password"
            class="form-control"
            required
            aria-label="Password"
          />
          <p class="mt-3">Forgot your password? <router-link to="/reset-password">Reset here</router-link>.</p>
        </div>
        
        <!-- Email Login Button -->
        <button type="submit" class="btn btn-primary btn-custom btn-block">
          Login
        </button>
      </form>

      <!-- Google Login Button -->
      <button @click="loginWithGoogle" class="btn btn-outline-danger btn-custom btn-block mt-3">
        <i class="fab fa-google"></i> Login with Google
      </button>

      <!-- Register Link -->
      <div class="text-center mt-3">
        <p>
          Don’t have an account?
          <router-link to="/register">Register Here</router-link>
        </p>
      </div>
    </div>
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

<style scoped>
/* Ensure consistent container styling */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa; /* Light background */
}

/* Style the login card similar to other components */
.login-card {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

h2 {
  font-weight: bold;
  color: #42b983; /* Primary color */
}

.form-group {
  margin-bottom: 1.5rem;
}

input {
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  width: 100%;
}

/* Custom button styles */
.btn-custom {
  background-color: #42b983; /* Primary theme color */
  color: white;
  border: none;
  padding: 0.75rem;
  font-size: 1rem;
  border-radius: 4px;
}

.btn-custom:hover {
  background-color: #3aa673;
}

/* Google login button outline style */
.btn-outline-danger {
  border-color: #3aa673;
  color: white;
}

.btn-outline-danger:hover {
  background-color: #3aa673;
  color: white;
}

.mt-3 {
  margin-top: 1rem;
}

.text-center {
  text-align: center;
}

/* Media query for smaller screens */
@media (max-width: 768px) {
  .login-card {
    padding: 1.5rem;
  }
}
</style>
