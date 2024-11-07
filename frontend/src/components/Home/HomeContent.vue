<template>
    <div>
      <!-- Carousel Section -->
      <section class="carousel">
        <div id="homeCarousel" class="carousel slide" data-bs-ride="carousel">
          <div class="carousel-inner">
            <div class="carousel-item carousel__item active">
              <img src="https://plus.unsplash.com/premium_photo-1673108852141-e8c3c22a4a22?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" class="d-block w-100 carousel__image" alt="Healthy Recipes">
              <div class="carousel-caption carousel__caption">
                <h2 class="carousel__title">Cook Healthier, Live Better</h2>
                <p class="carousel__text">Explore personalized healthy recipes based on your ingredients and dietary preferences.</p>
                <router-link to="/recipes" class="cta ">Discover Recipes</router-link>
              </div>
            </div>
            <div class="carousel-item carousel__item">
              <img src="@/assets/cauroselFridge.jpg" class="d-block w-100 carousel__image" alt="Virtual Fridge">
              <div class="carousel-caption carousel__caption">
                <h2 class="carousel__title">Virtual Fridge Management</h2>
                <p class="carousel__text">Track your ingredients and receive expiry alerts.</p>
                <router-link to="/fridge" class="cta">Manage Fridge</router-link>
              </div>
            </div>
            <div class="carousel-item carousel__item">
              <img src="@/assets/cauroselPlanner.jpg" class="d-block w-100 carousel__image" alt="Plan Your Meal">
              <div class="carousel-caption carousel__caption">
                <h2 class="carousel__title">Plan Your Meals</h2>
                <p class="carousel__text">Use up what you have and recieve recipes taylored to what you have.</p>
                <router-link to="/mealplanner" class="cta cta--planner">Plan Your Meals</router-link>
              </div>
            </div>
          </div>
          <button class="carousel__control carousel__control--prev" type="button" data-bs-target="#homeCarousel" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
          </button>
          <button class="carousel__control carousel__control--next" type="button" data-bs-target="#homeCarousel" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Next</span>
          </button>
        </div>
      </section>
  
      <!-- Home Page Content -->
      <div class="home">
        <div class="container" v-if="user">
          <h1 class="home__title">Welcome to HealthyChef, {{ user.displayName }}</h1>
          <p class="home__intro">
            HealthyChef encourages Singaporeans to cook healthier meals at home by offering a wide range of personalized healthy meal recipes.
          </p>
        </div>
    
        <div v-else>
          <p>Loading user information...</p>
        </div>
  
        <!-- Features Section -->
        <div class="features">
          <div class="features__item">
            <router-link class="features__title" to="/recipes">Personalized Recipes</router-link>
            <p class="features__description">Receive meal suggestions tailored to your available ingredients and dietary preferences for a balanced diet.</p>
          </div>
          <div class="features__item">
            <router-link class="features__title" to="/fridge">Virtual Fridge Management</router-link>
            <p class="features__description">Keep track of your ingredients and get notified before they expire with our virtual fridge and expiry alerts.</p>
          </div>
          <div class="features__item">
            <router-link class="features__title" to="/dashboard">Reduce Food Waste</router-link>
            <p class="features__description">Minimize food waste by using what you already have and exploring new recipes based on your inventory.</p>
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
