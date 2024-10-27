<template>
    <div>
      <!-- Carousel Section -->
      <section class="carousel-section">
        <div id="homeCarousel" class="carousel slide custom-carousel" data-bs-ride="carousel">
          <div class="carousel-inner">
            <div class="carousel-item active">
              <img src="https://plus.unsplash.com/premium_photo-1673108852141-e8c3c22a4a22?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" class="d-block w-100" alt="Healthy Recipes">
              <div class="carousel-caption d-none d-md-block">
                <h2>Cook Healthier, Live Better</h2>
                <p>Explore personalized healthy recipes based on your ingredients and dietary preferences.</p>
                <router-link to="/recipes" class="cta-button btn btn-primary">Discover Recipes</router-link>
              </div>
            </div>
            <div class="carousel-item">
              <img src="https://as2.ftcdn.net/v2/jpg/08/85/32/71/1000_F_885327124_pg2pKeDnoHioWqxYAPHo64xh187NfsJf.jpg" class="d-block w-100" alt="Virtual Fridge">
              <div class="carousel-caption d-none d-md-block">
                <h2>Virtual Fridge Management</h2>
                <p>Track your ingredients and receive expiry alerts.</p>
                <router-link to="/fridge" class="btn btn-primary cta-button">Manage Fridge</router-link>
              </div>
            </div>
            <div class="carousel-item">
              <img src="https://media.istockphoto.com/id/533345431/vector/plan-your-meal.jpg?s=2048x2048&w=is&k=20&c=7flNbk8oYUAWvqf6V4hDCM7Gr28Ft0zUl7QJQEOmNWg=" class="d-block w-100" alt="Plan Your Meal">
              <div class="carousel-caption d-none d-md-block">
                <h2>Plan Your Meals</h2>
                <p>Use up what you have and recieve recipes taylored to what you have.</p>
                <router-link to="/mealplanner" class="btn btn-primary cta-button">Plan Your Meals</router-link>
              </div>
            </div>
          </div>
          <button class="carousel-control-prev custom-control" type="button" data-bs-target="#homeCarousel" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
          </button>
          <button class="carousel-control-next custom-control" type="button" data-bs-target="#homeCarousel" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Next</span>
          </button>
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
    
        <div v-else>
          <p>Loading user information...</p>
        </div>
  
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
  import { auth, db } from '../../services/firebase';
  import { signOut } from 'firebase/auth';
  import { doc, getDoc } from 'firebase/firestore';
  import '../../styles/main.css';
  
  export default {
    name: 'HomeContent',
    data() {
      return {
        user: null,
      };
    },
    async created() {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
  
          if (userSnap.exists()) {
            this.user = userSnap.data();
          } else {
            console.error('No such document!');
          }
        } catch (error) {
          console.error('Error fetching user data:', error.message);
          this.$router.push('/login');
        }
      } else {
        this.$router.push('/login');
      }
    },
    methods: {
      async logout() {
        try {
          await signOut(auth);
          localStorage.removeItem('user');
          this.$router.push('/login');
        } catch (error) {
          alert('Logout failed: ' + error.message);
        }
      }
    }
  };
  </script>

<style scoped>
.custom-carousel .custom-control {
  background-color: var(--primary-color) !important;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.9;
}

.custom-carousel .custom-control:hover {
  opacity: 1;
}

.custom-carousel .carousel-control-prev {
  left: 20px;
}

.custom-carousel .carousel-control-next {
  right: 20px;
}
</style>
