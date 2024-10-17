<template>
  <div class="container">
    <h2>Register</h2>
    <form @submit.prevent="register">
      <div class="form-group">
        <label>Email</label>
        <input type="email" v-model="email" class="form-control" required />
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" v-model="password" class="form-control" required />
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" v-model="notifications" /> Receive notifications
        </label>
      </div>
      <button type="submit" class="btn btn-primary">Register</button>
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
    };
  },
  methods: {
    async register() {
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

        this.$router.push('/home');
      } catch (error) {
        console.error('Error during registration:', error.message);
      }
    }
  }
};
</script>
