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

<style scoped>
/* Block: login */
.login {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.login__container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.login__card {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.login__title {
  font-weight: bold;
  color: #42b983;
  text-align: center;
  margin-bottom: 1.5rem;
}

.login__form {
  margin-bottom: 1.5rem;
}

.login__form-group {
  margin-bottom: 1.5rem;
}

.login__label {
  display: block;
  margin-bottom: 0.5rem;
}

.login__input {
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  width: 100%;
}

.login__input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

.login__reset-text {
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.login__link {
  color: #42b983;
  text-decoration: none;
}

.login__link:hover {
  text-decoration: underline;
}

.login__button {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.login__button--primary {
  background-color: #42b983;
  color: white;
}

.login__button--primary:hover {
  background-color: #3aa673;
}

.login__button--google {
  background-color: white;
  border: 1px solid #3aa673;
  color: #3aa673;
  margin-top: 1rem;
}

.login__button--google:hover {
  background-color: #3aa673;
  color: white;
}

.login__alert {
  padding: 0.75rem;
  border-radius: 4px;
  margin: 1rem 0;
}

.login__alert--error {
  background-color: #fee2e2;
  border: 1px solid #ef4444;
  color: #dc2626;
}

.login__register {
  text-align: center;
  margin-top: 1.5rem;
}

.login__register-text {
  font-size: 0.875rem;
}

/* Media query for smaller screens */
@media (max-width: 768px) {
  .login__card {
    padding: 1.5rem;
  }
}
</style>