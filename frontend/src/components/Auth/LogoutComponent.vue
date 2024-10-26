<!-- src/components/LogoutComponent.vue -->
<template>
    <div class="logout-container">
      <p>Logging out, please wait...</p>
    </div>
  </template>
  
  <script>
  import { auth } from '@/services/firebase'; // Import Firebase auth
  
  export default {
    async created() {
      try {
        await auth.signOut(); // Sign out the user
        this.$router.push('/login'); // Redirect to login page after logout
      } catch (error) {
        console.error('Logout failed:', error);
      }
    },
  };
  </script>
  
  <style scoped>
  .logout-container {
    text-align: center;
    margin-top: 50px;
  }
  </style>
  