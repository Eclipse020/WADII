import { createRouter, createWebHistory } from 'vue-router';
import { auth } from '../services/firebase';

// Import Pages
import HomePage from '../pages/HomePage.vue';
import FridgePage from '../pages/FridgePage.vue';
import MealPlanner from '../pages/MealPlanner.vue';
import LoginPage from '../pages/LoginPage.vue';
import RegistrationPage from '../pages/RegistrationPage.vue';
import ResetPasswordPage from '../pages/ResetPasswordPage.vue';
import ProfileSettingsPage from '../pages/ProfileSettingsPage.vue';
import LogoutComponent from '../components/Auth/LogoutComponent.vue';

// Define routes, grouped logically
const routes = [
  // General routes
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: { requiresAuth: true },
  },
  {
    path: '/fridge',
    name: 'Fridge',
    component: FridgePage,
    meta: { requiresAuth: true },
  },
  {
    path: '/mealPlanner',
    name: 'MealPlanner',
    component: MealPlanner,
    meta: { requiresAuth: true },
  },

  // Authentication routes
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/register',
    name: 'Register',
    component: RegistrationPage,
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPasswordPage,
  },

  // User profile-related routes
  {
    path: '/profile',
    name: 'ProfileSettings',
    component: ProfileSettingsPage,
    meta: { requiresAuth: true },
  },
  // User logs out
  {
    path: '/logout',
    name: 'Logout',
    component: LogoutComponent,
    meta: { requiresAuth: true },
  }
];

// Create and configure the router
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for authenticated routes
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const user = auth.currentUser;

  if (requiresAuth && !user) {
    next('/login');
  } else {
    next();
  }
});

export default router;
