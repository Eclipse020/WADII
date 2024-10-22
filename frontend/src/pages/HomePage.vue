<template>
  <div>
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h2>Cook Healthier, Live Better</h2>
        <p>Explore personalized healthy recipes based on your ingredients and dietary preferences.</p>
        <router-link to="/recipes" class="cta-button">Discover Recipes</router-link>
      </div>
    </section>

    <!-- Home Page Content -->
    <div class="home-page">
      <div class="container" v-if="user">
        <h1>Welcome to HealthyChef, {{ user.displayName }}</h1>
        <p class="intro-text">
          HealthyChef encourages Singaporeans to cook healthier meals at home by offering a wide range of personalized healthy meal recipes.
        </p>
      </div>

      <!-- Display user-specific information if the user is logged in -->
      <!-- some user data includes: user.email, user.notifications, user.dietaryPreferences -->
      <div class="container" v-if="user">
        <h2>Welcome, </h2>
        <p>Your email: {{ user.email }}</p>
        <p>Receive notifications: {{ user.notifications }}</p>
        <p>Dietary Preferences: {{ user.dietaryPreferences }}</p>
        <button @click="logout" class="btn btn-danger">Logout</button>
      </div>

      <!-- If user is not loaded yet, show loading message -->
      <div v-else>
        <p>Loading user information...</p>
      </div>

      <router-link to="/settings" class="btn btn-secondary mt-3">Settings</router-link>

      <!-- Features Section -->
      <div class="features">
        <div class="feature-box">
          <h2>Personalized Recipes</h2>
          <p>Receive meal suggestions tailored to your available ingredients and dietary preferences for a balanced diet.</p>
        </div>
        <div class="feature-box">
          <h2>Virtual Fridge Management</h2>
          <p>Keep track of your ingredients and get notified before they expire with our virtual fridge and expiry alerts.</p>
        </div>
        <div class="feature-box">
          <h2>Reduce Food Waste</h2>
          <p>Minimize food waste by using what you already have and exploring new recipes based on your inventory.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { auth, db } from '../services/firebase';  // Firebase imports
import { signOut } from 'firebase/auth';           // Firebase auth method
import { doc, getDoc } from 'firebase/firestore';  // Firestore methods

export default {
  data() {
    return {
      user: null, // User data will be stored here
    };
  },
  async created() {
    const currentUser = auth.currentUser; // Get current user
    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid); // Reference to the user document
        const userSnap = await getDoc(userRef);            // Fetch user document

        if (userSnap.exists()) {
          this.user = userSnap.data(); // Load user data into the component
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching user data:', error.message);
        this.$router.push('/login'); // Redirect to login if error occurs
      }
    } else {
      this.$router.push('/login'); // Redirect to login if user not authenticated
    }
  },
  methods: {
    async logout() {
      try {
        await signOut(auth); // Sign out user
        localStorage.removeItem('user'); // Clear local storage
        this.$router.push('/login'); // Redirect to login page
      } catch (error) {
        alert('Logout failed: ' + error.message);
      }
    }
  }
};
</script>

<style scoped>
/* Styles for HomePage */
.home-page {
  text-align: center;
  padding: 30px;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  font-weight: bold;
  color: #42b983;
}

.intro-text {
  font-size: 1.2rem;
  margin-bottom: 30px;
  color: #2c3e50;
}

.features {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 20px;
}

.feature-box {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 300px;
  text-align: left;
}

.feature-box h2 {
  font-size: 1.5rem;
  color: #42b983;
  margin-bottom: 10px;
}

.feature-box p {
  font-size: 1rem;
  color: #2c3e50;
}

/* Hero Section */
.hero {
  background-image: url('https://kaizenaire.com/wp-content/uploads/2023/12/image-1901.jpeg'); /* Replace with your image */
  background-size: cover;
  background-position: center;
  padding: 80px 20px;
  color: white;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.hero-content h2 {
  font-size: 2.5rem; /* Adjusted hero heading size */
  margin-bottom: 20px;
  font-weight: 700;
}

.hero-content p {
  font-size: 1.2rem;
  margin-bottom: 30px;
}

.cta-button {
  padding: 15px 30px;
  background-color: #ffdb58;
  color: #2c3e50;
  text-decoration: none;
  font-weight: bold;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.cta-button:hover {
  background-color: #ffd700;
}
</style>
