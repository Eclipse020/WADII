import { createRouter, createWebHistory } from 'vue-router';
import { auth } from '../services/firebase';


// Import Pages
import HomePage from '../pages/HomePage.vue';
import FridgePage from '../pages/FridgePage.vue';
import SummaryPage from '../pages/SummaryPage.vue';
import CustomizePage from '../pages/CustomizePage.vue';
import MealPlannerPage from '../pages/MealPlanner.vue';
import LoginPage from '../pages/LoginPage.vue';
import RegistrationPage from '../pages/RegistrationPage.vue';
import ResetPasswordPage from '../pages/ResetPasswordPage.vue';
import ProfileSettingsPage from '../pages/ProfileSettingsPage.vue';
import LogoutComponent from '../components/Auth/LogoutComponent.vue';
import CookingHistory from '../components/History/History.vue';
import CalendarPage from '../components/History/CalendarPage.vue';
import RecipeDetails from '../components/Community/CRecipeDetails.vue';
import PostRecipe from '../components/Community/CPostRecipe.vue';
import PostDrafts from '../components/Community/CPostDrafts.vue';
import RecipeList from '../components/Community/CRecipeList.vue';

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
    path: '/summary',
    name: 'Summary',
    component: SummaryPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/customize',
    name: 'Customize',
    component: CustomizePage,
    meta: { requiresAuth: true },
  },
  {
    path: '/mealPlanner',
    name: 'MealPlanner',
    component: MealPlannerPage,
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
  },

  //history + community

  {
    path: '/history',
    name: 'CookingHistory',
    component: CookingHistory,
  },
  {
    path: '/calendar',
    name: 'CalendarPage',
    component: CalendarPage,
  },
  {
    path: '/community',
    name: 'Community',
    component: RecipeList // Displays list of all community recipes
  },
  {
    path: '/community/recipe/:id',
    name: 'RecipeDetails',
    component: RecipeDetails, // Displays the details of a single recipe
    props: true // Allows passing the recipe ID as a prop
  },
  {
    path: '/community/post-recipe',
    name: 'PostRecipe',
    component: PostRecipe // Page to create a new recipe
  },
  {
    path: '/community/drafts',
    name: 'PostDrafts',
    component: PostDrafts // Page to view/manage recipe drafts
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
