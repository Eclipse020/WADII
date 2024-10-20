<template>
  <div id="app">
    <!-- Header Section -->
    <header class="app-header">
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
        <router-link to="/planner" class="nav-link">
          <i class="fas fa-calendar-alt"></i> Meal Planner
        </router-link>
        <router-link to="/profile" class="nav-link">
          <i class="fas fa-user"></i> Profile
        </router-link>
      </nav>
    </header>

    <!-- Main Content -->
    <main>
      <router-view />
    </main>

    <!-- Footer Section -->
    <footer>
      <p>&copy; 2024 HealthyChef. All rights reserved.</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style scoped>
/* General Reset for Body and HTML */
html, body {
  margin: 0; /* Remove default margin */
  padding: 0; /* Remove default padding */
  height: 100%; /* Full height */
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
  flex-direction: column; /* Stack logo and nav vertically */
  align-items: center; /* Center items horizontally */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.logo-heading-container {
  display: flex;
  align-items: center;
  margin-bottom: 15px; /* Space between logo and nav */
}

.logo {
  height: 50px; /* Decreased logo size */
  margin-right: 10px; /* Adjusted spacing */
}

h1 {
  font-size: 1.5rem; /* Decreased heading size */
  font-weight: 700;
  letter-spacing: 1.5px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
  margin: 0;
}

/* Navigation Styling */
.app-nav {
  display: flex;
  gap: 20px;
  flex-wrap: wrap; /* Allow wrapping on smaller screens */
  justify-content: center; /* Center nav items */
}

.nav-link {
  color: white;
  font-size: 1rem; /* Decreased font size for links */
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
  margin-top: 20px;
  font-size: 0.8em;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .logo {
    height: 40px; /* Smaller logo for smaller screens */
  }

  h1 {
    font-size: 1.2rem; /* Smaller heading size */
  }

  .nav-link {
    font-size: 0.9rem; /* Smaller font size for links */
  }

  .app-nav {
    flex-direction: column; /* Stack nav links vertically */
  }
}
</style>
