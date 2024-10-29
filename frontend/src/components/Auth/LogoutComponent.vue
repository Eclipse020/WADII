<template>
  <div class="logout">
    <div class="logout__container">
      <div class="logout__card">
        <!-- Loading State -->
        <div v-if="isLoading" class="logout__content">
          <div class="logout__spinner"></div>
          <p class="logout__message">Logging out, please wait...</p>
        </div>

        <!-- Error State -->
        <div v-if="error" class="logout__content">
          <div class="logout__alert logout__alert--error">
            {{ error }}
          </div>
          <button @click="retryLogout" class="logout__button">
            Try Again
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { auth } from '@/services/firebase';

export default {
  data() {
    return {
      isLoading: true,
      error: null
    };
  },
  methods: {
    async retryLogout() {
      this.error = null;
      this.isLoading = true;
      await this.performLogout();
    },
    async performLogout() {
      try {
        await auth.signOut();
        this.$router.push('/login');
      } catch (error) {
        console.error('Logout failed:', error);
        this.error = 'Failed to log out. Please try again.';
        this.isLoading = false;
      }
    }
  },
  async created() {
    await this.performLogout();
  }
};
</script>

<style scoped>
/* Block: logout */
.logout {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.logout__container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.logout__card {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.logout__content {
  text-align: center;
}

.logout__message {
  color: #374151;
  font-size: 1.125rem;
  margin: 1rem 0;
}

/* Spinner Element */
.logout__spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

/* Alert Element */
.logout__alert {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.logout__alert--error {
  background-color: #fee2e2;
  border: 1px solid #ef4444;
  color: #dc2626;
}

/* Button Element */
.logout__button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.logout__button:hover {
  background-color: #3aa673;
}

/* Spinner Animation */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Media query for smaller screens */
@media (max-width: 768px) {
  .logout__card {
    padding: 1.5rem;
    margin: 1rem;
  }
}
</style>