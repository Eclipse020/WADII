<template>
  <div id="app">
    <!-- Conditionally show header and footer only if user is authenticated -->
    <header v-if="isAuthenticated" class="app-header">
      <div class="logo-heading-container">
        <img :src="require('@/assets/healthychef.png')" alt="HealthyChef Logo" class="logo" />
        <h1>HealthyChef</h1>
      </div>
      <nav class="app-nav">
        <router-link to="/" class="nav-link">
          <i class="fas fa-home"></i> Home
        </router-link>
        <router-link to="/dashboard" class="nav-link">
          <i class="fas fa-tachometer-alt"></i> Dashboard
        </router-link>
        <router-link to="/fridge" class="nav-link">
          <i class="fas fa-ice-cream"></i> Fridge Management
        </router-link>
        <router-link to="/recipes" class="nav-link">
          <i class="fas fa-utensils"></i> Recipes
        </router-link>
        <router-link to="/mealPlanner" class="nav-link">
          <i class="fas fa-calendar-alt"></i> Meal Planner
        </router-link>
        <router-link to="/profile" class="nav-link">
          <i class="fas fa-user"></i> Profile
        </router-link>
        <router-link to="/logout" class="nav-link">
          Logout
        </router-link>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="container-fluid p-0">
      <div @mousemove="resetTimer" @keydown="resetTimer" @click="resetTimer">
        <router-view />
      </div>
    </main>

    <!-- Conditionally show footer only if user is authenticated -->
    <footer v-if="isAuthenticated">
      <p>&copy; 2024 HealthyChef. All rights reserved.</p>
    </footer>
  </div>
</template>

<script>
import { auth } from '@/services/firebase'; // Import Firebase Authentication
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default {
  name: 'App',
  data() {
    return {
      timeout: null, // Holds the timeout ID
      idleTimeLimit: 15 * 60 * 1000, // 15 minutes inactivity time limit (in milliseconds)
      isAuthenticated: false, // Track the authentication state
    };
  },
  methods: {
    startTimer() {
      // Clear any existing timer
      if (this.timeout) clearTimeout(this.timeout);

      // Start a new timer
      this.timeout = setTimeout(() => {
        this.logoutUser();
      }, this.idleTimeLimit); // Logout after 15 minutes of inactivity
    },
    resetTimer() {
      // Reset the timer on user activity
      this.startTimer();
    },
    logoutUser() {
      const auth = getAuth();
      auth.signOut()
        .then(() => {
          // Redirect to login after logout
          this.$router.push('/login');
        })
        .catch((error) => {
          console.error('Error logging out:', error);
        });
    },
  },
  mounted() {
    // Watch for changes in the user's authentication state
    auth.onAuthStateChanged((user) => {
      this.isAuthenticated = !!user; // If user exists, set isAuthenticated to true
    });
  },
  created() {
    const auth = getAuth();
    
    // Monitor auth state on page load
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, redirect to homepage
        this.$router.push('/');
      } else {
        // No user signed in, redirect to login
        this.$router.push('/login');
      }
    });
  },
};
</script>

<style scoped>
/* General Reset for Body and HTML */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

/* General App Styling */
#app {
  font-family: 'Poppins', sans-serif;
  color: #2c3e50;
  text-align: center;
}

/* Header Styling */
.app-header {
  background-color: #42b983;
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.logo-heading-container {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.logo {
  height: 50px;
  margin-right: 10px;
}

h1 {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
  margin: 0;
}

/* Navigation Styling */
.app-nav {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.nav-link {
  color: white;
  font-size: 1rem;
  font-weight: bold;
  text-decoration: none;
  position: relative;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #ffdb58;
}

/* Profile and Logout Styling */
.profile-logout-container {
  display: flex;
  align-items: center;
  gap: 10px; /* Space between Profile and Logout */
}

.logout-button {
  padding: 5px 10px;
  font-size: 1rem;
  color: white;
  background-color: #42b983;
  border-collapse: collapse;
}

.logout-button:hover {
  background-color: #42b983;
}

/* Footer Styling */
footer {
  background-color: #42b983;
  color: white;
  padding: 20px;
  font-size: 0.8em;
  text-align: center;
  width: 100%;
  position: relative;
  bottom: 0;
}

.container-fluid {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  flex-grow: 1;
}

</style>
