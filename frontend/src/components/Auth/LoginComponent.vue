<template>
  <div class="login">
    <div class="login__container">
      <div class="login__card">
        <h2 class="login__title">Welcome to HealthyChef!</h2>

        <!-- Email and Password Login Form -->
        <form @submit.prevent="loginWithEmail" class="login__form">
          <div class="login__form-group">
            <label class="login__label" for="email">Email: </label>
            <input
              type="email"
              v-model="email"
              placeholder="Email address"
              class="login__input"
              required
              aria-label="Email"
            />
          </div>

          <div class="login__form-group">
            <label class="login__label" for="password">Password: </label>
            <input
              type="password"
              v-model="password"
              placeholder="Password"
              class="login__input"
              required
              aria-label="Password"
            />
            <p class="login__reset-text">
              Forgot your password? 
              <router-link to="/reset-password" class="login__link">Reset here</router-link>.
            </p>
          </div>
          
          <button type="submit" class="login__button login__button--primary">
            Login
          </button>
        </form>

        <!-- Display error message if it exists -->
        <div v-if="errorMessage" class="login__alert login__alert--error">
          {{ errorMessage }}
        </div>

        <div>Or</div>
        
        <!-- Google Login Button -->
        <button @click="loginWithGoogle" class="login__button login__button--google">
          <i class="fab fa-google"></i> Login with Google
        </button>

        <!-- Register Link -->
        <div class="login__register">
          <p class="login__register-text">
            Don't have an account?
            <router-link to="/register" class="login__link">Register Here</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Script section remains unchanged
import { auth, db, googleProvider, signInWithPopup } from '../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import '../../styles/main.css';

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
        if (error.code === 'auth/wrong-password') {
          this.errorMessage = 'Incorrect password. Please try again.';
        } else if (error.code === 'auth/user-not-found') {
          this.errorMessage = 'No user found with this email address.';
        } else if (error.code === 'auth/invalid-email') {
          this.errorMessage = 'Invalid email format. Please check your email.';
        } else {
          this.errorMessage = 'Login failed. Have you registered an account?';
        }
        console.error(error);
      }
    },
    async loginWithGoogle() {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', user.uid), {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            uid: user.uid,
            dietaryPreferences: [],
            notifications: false,
            createdAt: new Date(),
            updatedAt: new Date(),
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

