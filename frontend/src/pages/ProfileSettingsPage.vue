<!-- src/pages/ProfileSettingsPage.vue -->
<template>
    <div>
      <ProfileSettings />
    </div>
    <router-link to="/" class="btn btn-secondary mt-3">Home</router-link>
  </template>
  
  <script>
  import ProfileSettings from '@/components/Profile/ProfileSettings.vue';
  
  export default {
    components: {
      ProfileSettings,
    },
  };
  </script>
  