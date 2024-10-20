import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../pages/HomePage.vue'; // Updated import
import FridgePage from '../pages/FridgePage.vue'; // Updated import
import MealPlanner from '../pages/MealPlanner.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage, // Updated component
  },
  {
    path: '/fridge',
    name: 'Fridge',
    component: FridgePage, // Updated component
  },
  // ... other routes
  {
    path: '/mealPlanner',
    name: 'mealPlanner',
    component: MealPlanner,
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
