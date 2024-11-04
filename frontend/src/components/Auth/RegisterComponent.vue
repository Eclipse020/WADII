<template>
  <div class="register d-flex justify-content-center align-items-center min-vh-100 bg-light">
    <div class="register__card card p-4 shadow-sm">
      <h2 class="register__title text-center mb-4">Register</h2>
      <form class="register__form" @submit.prevent="handleSubmit">
        <div class="register__form-group mb-3">
          <label for="email" class="register__label form-label">Email:</label>
          <input
            id="email"
            type="email"
            v-model="formData.email"
            class="register__input form-control"
            placeholder="Email"
            required
            aria-label="Email"
          />
        </div>

        <div class="register__form-group mb-3">
          <label for="displayName" class="register__label form-label">Display Name:</label>
          <input
            id="displayName"
            type="text"
            v-model="formData.displayName"
            class="register__input form-control"
            placeholder="Display Name"
            aria-label="Display Name"
          />
        </div>


        <div class="register__form-group mb-3">
          <label for="password" class="register__label form-label">Password:</label>
          <input
            id="password"
            :type="passwordVisible ? 'text' : 'password'"
            v-model="formData.password"
            class="register__input form-control"
            placeholder="Password"
            required
            aria-label="Password"
          />
          <!-- Show password length error message -->
          <div v-if="passwordLengthError" class="register__error alert alert-danger mt-2">
            Password must be between 6 and 4096 characters.
          </div>
        </div>

        <div class="register__form-group mb-3">
          <label for="confirmPassword" class="register__label form-label">Confirm Password:</label>
          <input
            id="confirmPassword"
            :type="passwordVisible ? 'text' : 'password'"
            v-model="formData.confirmPassword"
            class="register__input form-control"
            placeholder="Confirm Password"
            required
            aria-label="Confirm Password"
          />
          <!-- Show password match error message -->
          <div v-if="passwordMatchError" class="register__error alert alert-danger mt-2">
            Passwords do not match.
          </div>
        </div>

        <button 
          type="button"
          class="register__toggle-btn btn btn-success w-100"
          @click="passwordVisible = !passwordVisible"
        >
          {{ passwordVisible ? 'Hide Passwords' : 'Show Passwords' }}
        </button>

        <div class="register__form-group form-check mb-3">
          <div>
            <input
              type="checkbox"
              id="notifications"
              v-model="formData.notifications"
              class="register__checkbox form-check-input"
            />
            <label for="notifications" class="register__checkbox-label form-check-label">
              I would like to receive notifications.
            </label>
          </div>
        </div>

        <button 
          type="submit" 
          class="register__submit-btn btn btn-success w-100"
          :disabled="passwordLengthError || passwordMatchError"
        >
          Register
        </button>
      </form>

      <p class="register__login-link text-center mt-3">
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  </div>
</template>

<script>
import { auth, db } from '@/services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import '../../styles/main.css';

export default {
  name: 'RegisterForm',
  data() {
  return {
    formData: {
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '', // New field for display name
      notifications: false,
    },
    passwordVisible: false,
    };
  },
  computed: {
    passwordLengthError() {
      const { password } = this.formData;
      return password.length < 6 || password.length > 4096;
    },
    passwordMatchError() {
      const { password, confirmPassword } = this.formData;
      return password && confirmPassword && password !== confirmPassword;
    }
  },
  methods: {
    async handleSubmit() {
      if (!this.passwordLengthError && !this.passwordMatchError) {
        try {
          // Create a new user with Firebase Auth
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            this.formData.email,
            this.formData.password
          );

          // Get the newly created user
          const user = userCredential.user;

          // Set the user data in Firestore
          await setDoc(doc(db, 'users', user.uid), {
            email: this.formData.email,
            dietaryPreferences: [],
            displayName: this.formData.displayName || '', // Add display name if applicable
            notifications: this.formData.notifications,
            photoURL: user.photoURL || '', // Add photoURL if needed
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          // Redirect or show a success message
          alert('Registration successful!');
          this.$router.push('/profile')
        } catch (error) {
          console.error('Error registering user:', error);
          alert('Failed to register. Please try again.');
        }
      }
    },
  },
}
</script>
