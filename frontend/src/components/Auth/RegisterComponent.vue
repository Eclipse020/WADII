<template>
    <div class="container">
      <h2>Register</h2>
      <form @submit.prevent="register">
        <!-- Email -->
        <div class="form-group">
          <label>Email: </label>
          <input 
          type="email" 
          v-model="email"
          placeholder="Email" 
          class="form-control" 
          required 
          aria-label="Email"
          />
        </div>
  
        <!-- Password -->
        <div class="form-group">
          <label>Password: </label>
          <input
            :type="passwordVisible ? 'text' : 'password'"
            v-model="password"
            placeholder="Password"
            class="form-control"
            required
            aria-label="Password"
          />
        </div>
  
        <!-- Confirm Password -->
        <div class="form-group">
          <label>Confirm Password: </label>
          <input
            :type="passwordVisible ? 'text' : 'password'"
            v-model="confirmPassword"
            placeholder="Confirm Password"
            class="form-control"
            required
            aria-label="Confirm Password"
          />
        </div>
        <!-- Show/Hide Password fields -->
        <div>
          <button type="button" class="btn btn-outline-secondary" @click="togglePasswordVisibility">
              {{ passwordVisible ? 'Hide Passwords' : 'Show Passwords' }}
            </button>
        </div>
        <!-- If password field don't match, show error -->
        <div v-if="passwordError" class="text-danger mt-2">
          Passwords do not match!
        </div>
        <!-- Receive notifications checkbox -->
        <div class="form-group">
          <label>Do you want to receive notifications?</label>
          <label>
            <input type="checkbox" v-model="notifications" /> Yes, I would like to receive notifications.
          </label>
          <!-- Register button -->
        </div>
        <button type="submit" class="btn btn-primary" :disabled="passwordsDontMatch">
          Register
        </button>
      </form>
      <p>Already have an account? <router-link to="/login">Login</router-link></p>
    </div>
  </template>
  
  <script>
  import { createUserWithEmailAndPassword } from 'firebase/auth';
  import { auth, db } from '../../services/firebase';
  import { doc, setDoc } from 'firebase/firestore';
  
  export default {
    data() {
      return {
        email: '',
        password: '',
        notifications: false, // New data property for notifications
        confirmPassword: '', // For password confirmation
        passwordError: false,
        passwordVisible: false, // To toggle password visibility
      };
    },
    watch: {
      // Watch for changes in the password and confirmPassword fields and check if they match
      password() {
        this.validatePasswords();
      },
      confirmPassword() {
        this.validatePasswords();
      },
    },
    computed: {
      passwordsDontMatch() {
        return this.password !== this.confirmPassword;
      },
    },
    methods: {
      togglePasswordVisibility() {
        this.passwordVisible = !this.passwordVisible;
      },
      validatePasswords() {
        // Directly update passwordError based on whether passwords match
        this.passwordError = this.password !== this.confirmPassword;
      },
      async register() {
        this.validatePasswords(); // Ensure passwords are validated before submitting
  
        if (this.passwordError) {
          return;
        }
  
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
          const user = userCredential.user;
  
          // Save user profile in Firestore, including notifications preference
          await setDoc(doc(db, 'users', user.uid), {
            email: this.email,
            displayName: this.email.split('@')[0], // Example to set display name
            dietaryPreferences: [], // Default to empty array
            notifications: this.notifications, // Save notification preference
            createdAt: new Date(),
            updatedAt: new Date(),
          });
  
          this.$router.push('/login');
        } catch (error) {
          console.error('Registration error:', error.message);
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .text-danger {
    color: red; /* You can adjust the color or add more styles */
    font-weight: bold;
    margin-top: 5px;
  }
  
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
    width: fit-content;
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