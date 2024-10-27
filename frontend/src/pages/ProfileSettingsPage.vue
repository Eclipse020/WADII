<!-- src/pages/ProfileSettingsPage.vue -->
<template>
    <div>
      <router-link to="/history">
      <button class="history-button">View Cooking History</button>
      </router-link>
      <ProfileSettings />
    </div>
  </template>
  
  <script>
  import ProfileSettings from '@/components/Profile/ProfileSettings.vue';
  
  export default {
    components: {
      ProfileSettings,
    },
  };
  </script>

  
  