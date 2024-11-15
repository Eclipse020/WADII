<template>
  <div id="app">
    <!-- Conditionally show header and footer only if user is authenticated -->
    <header v-if="isAuthenticated" class="app-header">
      <div class="logo-heading-container d-flex align-items-center">
        <img :src="require('@/assets/healthychef.png')" alt="HealthyChef Logo" class="logo" />
        <h1 class="header-title">HealthyChef</h1>
      </div>
        <nav class="app-nav d-flex">
          <router-link to="/" class="nav-link">
            <i class="fas fa-home"></i> Home
          </router-link>
          <router-link to="/dashboard" class="nav-link ">
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
          <router-link to="/community" class="nav-link">
            <i class="fas fa-users"></i> Community
          </router-link>
          <router-link to="/profile" class="nav-link">
            <i class="fas fa-user"></i> Profile
          </router-link>
          <router-link to="/logout" class="nav-link" @click.prevent="logoutUser">
            Logout
          </router-link>
        </nav>
    </header>

    <!-- Main Content -->
    <main class="container-fluid p-0 content" @mousemove="resetTimer" @keydown="resetTimer" @click="resetTimer">
      <router-view />
    </main>

    <!-- Conditionally show footer only if user is authenticated -->
    <footer class="footer" v-if="isAuthenticated">
      <p>&copy; 2024 HealthyChef. All rights reserved.</p>
    </footer>
  </div>
</template>

<script>
// import { auth } from '@/services/firebase';
import { getAuth, onAuthStateChanged, setPersistence, browserSessionPersistence } from 'firebase/auth';
import './styles/main.css';

export default {
  name: 'App',
  data() {
    return {
      timeout: null,
      idleTimeLimit: 15 * 60 * 1000, // 15 minutes
      isAuthenticated: false,
    };
  },
  methods: {
    startTimer() {
      if (this.timeout) clearTimeout(this.timeout);
      this.timeout = setTimeout(this.logoutUser, this.idleTimeLimit);
    },
    resetTimer() {
      if (this.isAuthenticated) this.startTimer();
    },
    logoutUser() {
      const auth = getAuth();
      auth.signOut()
        .then(() => {
          clearTimeout(this.timeout); // Clear timer on logout
          this.isAuthenticated = false;
          this.$router.push('/login');
        })
        .catch((error) => {
          console.error('Error logging out:', error);
        });
    },
  },
  mounted() {
    const auth = getAuth();

    // Set session persistence
    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        // Watch authentication state
        onAuthStateChanged(auth, (user) => {
          this.isAuthenticated = !!user;
          if (!user) {
            this.$router.push('/login');
          } else {
            this.$router.push('/');
            this.startTimer(); // Start inactivity timer if logged in
          }
        });
      })
      .catch((error) => {
        console.error('Error setting persistence:', error);
      });
  },
  beforeUnmount() {
    // Clear timeout and remove any global event listeners
    clearTimeout(this.timeout);
  },
};
</script>

<style scoped>
/* CSS Variables for consistent theming */
:root {
  --primary-color: #00796b; /* Updated to match the teal color */
  --text-primary: #2c3e50;
  --background-light: #ffffff;
  --accent-medium: #00796b;
  --accent-border: #00695c;
  --hover-color: rgba(255, 255, 255, 0.1);
  --footer-color: #2c3e50;
}

/* General Reset for Body and HTML */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}


/* Header Styling */
.app-header {
  background-color: var(--primary-color);
  color: white;
  padding: 10px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: sticky; /* Change to sticky */
  top: 0; /* Stick to the top of the viewport */
  z-index: 1000; /* Ensure it stays above other content */
  width: 100%; /* Set width to 100% of the viewport */
}

.logo-heading-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  height: 40px;
}

.header-title {
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: white;
  margin: 0;
}

h1 {
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
  margin: 0;
  color: var(--primary-color);
}

/* Navigation Styling */
.app-nav {
  padding: 25px 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: auto; /* Push nav items to the right */
}

.nav-link {
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap; /* Prevent text wrapping */
}

.nav-link i {
  font-size: 1rem;
}

.nav-link:hover {
  background-color: var(--hover-color);
  transform: translateY(-1px);
  color: white;
}

/* Profile and Logout Styling */
.nav-link[to="/profile"],
.nav-link[to="/logout"] {
  font-size: 0.85rem;
  padding: 4px 10px;
}

/* Content Styling */
.content {
  flex-grow: 1;
  padding: 30px;
}

.intro-text {
  font-size: 1.2rem;
  margin-bottom: 30px;
  color: var(--text-primary);
}

/* Footer Styling */
footer {
  background-color: var(--footer-color);
  color: white;
  padding: 20px;
  font-size: 0.9em;
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

/* Responsive Design */
@media (max-width: 1200px) {
  .app-header {
    padding: 10px 15px;
  }
  
  .nav-link {
    font-size: 0.85rem;
    padding: 4px 8px;
  }
  
  .header-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 1323px) {
  /* Center-align items in the app header */
  .app-header {
    flex-direction: column;
    align-items: center; /* Centers content horizontally */
    padding: 15px;
  }

  .logo-heading-container {
    margin-bottom: 15px;
    text-align: center; /* Centers logo and title */
  }

  .app-nav {
    display: flex;
    justify-content: center; /* Centers the nav items */
    flex-wrap: wrap;
    gap: 10px;
    width: 100%; /* Ensures nav takes full width */
  }
  
  .nav-link {
    text-align: center; /* Centers text within each link */
  }
}


@media (max-width: 992px) {
  .app-header {
    flex-direction: column;
    padding: 15px;
  }

  .logo-heading-container {
    margin-bottom: 15px;
  }

  .app-nav {
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
  }
}

</style>
