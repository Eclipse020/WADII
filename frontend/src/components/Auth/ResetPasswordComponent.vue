<!-- src/components/Auth/ResetPasswordComponent.vue -->
<template>
    <div class="container mt-5">
      <h2>Reset Your Password</h2>
      <p>Enter your email address, and we'll send you a link to reset your password.</p>
      <form @submit.prevent="resetPassword">
        <div class="form-group">
          <input
            type="email"
            v-model="email"
            class="form-control"
            placeholder="Email"
            required
          />
        </div>
        <button type="submit" class="btn btn-primary mt-3">Send Reset Link</button>
      </form>
  
      <div v-if="message" class="alert alert-success mt-3">
        {{ message }}
      </div>
  
      <div v-if="error" class="alert alert-danger mt-3">
        {{ error }}
      </div>
    </div>
  </template>
  
  <script>
  import { sendPasswordResetEmail } from 'firebase/auth';
  import { auth } from '../../services/firebase';
  
  export default {
    data() {
      return {
        email: '',
        message: '',
        error: '',
      };
    },
    methods: {
      async resetPassword() {
        this.message = '';
        this.error = '';
        try {
          await sendPasswordResetEmail(auth, this.email);
          this.message = 'Password reset email sent! Please check your inbox.';
        } catch (error) {
          this.error = 'Error sending reset email. Please check the email entered or try again later.';
          console.error(error);
        }
      },
    },
  };
  </script>
  