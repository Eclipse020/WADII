<template>
  <div>
    <Login />
    <p class="mt-3">
      Forgot your password? <router-link to="/reset-password">Reset here</router-link>.
    </p>
  </div>
</template>

<script>
import Login from '@/components/Auth/LoginComponent.vue';

export default {
  components: {
    Login
  }
};
</script>