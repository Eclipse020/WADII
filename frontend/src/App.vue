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
      </nav>
    </header>

    <!-- Main Content -->
    <main class="container-fluid p-0">
      <router-view />
    </main>

    <!-- Conditionally show footer only if user is authenticated -->
    <footer v-if="isAuthenticated">
      <p>&copy; 2024 HealthyChef. All rights reserved.</p>
    </footer>
  </div>
</template>

<script>
import { auth } from '@/services/firebase';

export default {
  name: 'App',
  data() {
    return {
      isAuthenticated: false, // Track the authentication state
    };
  },
  mounted() {
    // Watch for changes in the user's authentication state
    auth.onAuthStateChanged((user) => {
      this.isAuthenticated = !!user; // If user exists, set isAuthenticated to true
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
</style>
