<template>
  <div class="container" v-if="user">
    <h2>Welcome, {{ user.displayName }}</h2>
    <p>Your email: {{ user.email }}</p>
    <p>Display Name: {{ user.displayName }}</p>
    <p>Receive notifications: {{ user.notifications }}</p>
    <p>Dietary Preferences: {{ user.dietaryPreferences }}</p>
    <button @click="logout" class="btn btn-danger">Logout</button>
  </div>
  <div v-else>
    <p>Loading user information...</p>
  </div>
  <router-link to="/settings" class="btn btn-secondary mt-3">Settings</router-link>
</template>

<script>
import { auth, db } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default {
  data() {
    return {
      user: null,
    };
  },
  async created() {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          this.user = userSnap.data();
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching user data:', error.message);
        this.$router.push('/login'); // Redirect if error occurs
      }
    } else {
      this.$router.push('/login');
    }
  },
  methods: {
    async logout() {
      try {
        await signOut(auth);
        localStorage.removeItem('user');  // Clear the user information
        this.$router.push('/login');
      } catch (error) {
        alert('Logout failed: ' + error.message);
      }
    }
  }
};
</script>

<style scoped>
/* Optional styles */
</style>
