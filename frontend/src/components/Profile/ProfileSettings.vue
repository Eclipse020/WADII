<template>
  <div class="container">
    <h2>Profile Settings</h2>
    <form @submit.prevent="updateProfile">
      <div class="form-group">
        <label>Email</label>
        <input type="email" v-model="user.email" class="form-control" readonly />
      </div>
      <div class="form-group">
        <label>Display Name</label>
        <input type="text" v-model="user.displayName" class="form-control" required />
      </div>
      <div class="form-group">
        <label>Dietary Preferences</label>
        <div>
          <label>
            <input type="checkbox" value="vegetarian" v-model="user.dietaryPreferences" /> Vegetarian
          </label>
          <label>
            <input type="checkbox" value="vegan" v-model="user.dietaryPreferences" /> Vegan
          </label>
          <label>
            <input type="checkbox" value="gluten-free" v-model="user.dietaryPreferences" /> Gluten-Free
          </label>
          <label>
            <input type="checkbox" value="none" v-model="user.dietaryPreferences" /> None
          </label>
        </div>
      </div>
      <div class="form-group">
        <label>Notification Preferences:</label>
        <input type="checkbox" v-model="user.notifications" /> I would like to receive notifications!
      </div>
      <button type="submit" class="btn btn-primary">Update Profile</button>
      <div v-if="message" class="alert alert-success mt-3">{{ message }}</div>
      <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
    </form>
  </div>
</template>

<script>
import { db } from '../../services/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export default {
  data() {
    return {
      user: {
        email: '',
        displayName: '',
        dietaryPreferences: [], // Changed to an array for multiple selections
        notifications: false, // Default value
      },
      message: '',
      error: '',
    };
  },
  async created() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      this.user.email = user.email;
      // Fetch additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        this.user = { ...this.user, ...userDoc.data() };
      }
    }
  },
  methods: {
    async updateProfile() {
      this.message = '';
      this.error = '';
      const user = JSON.parse(localStorage.getItem('user'));
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          displayName: this.user.displayName,
          dietaryPreferences: this.user.dietaryPreferences, // Update as an array
          notifications: this.user.notifications, // Include notifications
        });
        this.message = 'Profile updated successfully!';
      } catch (error) {
        this.error = 'Error updating profile: ' + error.message;
      }
    },
  },
};
</script>

<style scoped>
/* Add your styles here */
</style>
