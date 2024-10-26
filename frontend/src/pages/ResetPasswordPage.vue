<!-- src/pages/ResetPasswordPage.vue -->
<template>
    <div>
      <ResetPasswordComponent />
    </div>
    <p class="mt-3">
      Back to login page: <router-link to="/login">Login Page</router-link>.
    </p>
  </template>
  
  <script>
  import ResetPasswordComponent from '../components/Auth/ResetPasswordComponent.vue';
  
  export default {
    components: {
      ResetPasswordComponent,
    },
  };
  </script>
  