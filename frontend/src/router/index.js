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
import RecipeList from '../components/Recipes/RecipeList.vue';
import RecipeDetails from '../components/Recipes/RecipeDetails.vue';
import CookNow from '../components/Recipes/CookNow.vue';
import CCookNow from '../components/Community/CCookNow.vue';
import FavouritesDisplay from '../components/Recipes/FavouritesDisplay.vue';
import CommunityPage from '../pages/CommunityPage.vue';
import DashboardSummary from '../components/Dashboard/DashboardSummary.vue';
import PostRecipePage from '../pages/PostRecipePage.vue';
import RecipeDetailPage from '../pages/RecipeDetailPage.vue';
// import RecipeDeComponent from '../components/Community/RecipeDeComponent.vue';

// Define routes, grouped logically
const routes = [
  // General routes
  { path: '/', name: 'Home', component: HomePage, meta: { requiresAuth: true } },
  { path: '/fridge', name: 'Fridge', component: FridgePage, meta: { requiresAuth: true } },
  { path: '/summary', name: 'Summary', component: SummaryPage, meta: { requiresAuth: true } },
  { path: '/customize', name: 'Customize', component: CustomizePage, meta: { requiresAuth: true } },
  { path: '/mealPlanner', name: 'MealPlanner', component: MealPlannerPage, meta: { requiresAuth: true } },
  { path: '/community', name: 'Community', component: CommunityPage, meta: { requiresAuth: true } },
  { path: '/dashboard', name: 'Dashboard', component: DashboardSummary, meta: { requiresAuth: true } },
  { path: '/community/postrecipe', name: 'PostRecipe', component: PostRecipePage, meta: { requiresAuth: true } },
  
  // Recipe routes
  { path: '/recipes', name: 'RecipeList', component: RecipeList, meta: { requiresAuth: true } },
  { 
    path: '/recipe/:id', 
    name: 'RecipeDetails', 
    component: RecipeDetails, 
    meta: { requiresAuth: true },
    props: true 
  },
  {
    path: '/recipe/:id/cook',
    name: 'CookNow',
    component: CookNow,
    props: route => ({
      requiredIngredients: JSON.parse(route.query.requiredIngredients || '[]'),
      fridgeIngredients: JSON.parse(route.query.fridgeIngredients || '[]'),
    })
  },
  { path: '/favourites', name: 'Favourites', component: FavouritesDisplay, meta: { requiresAuth: true } },

  // Authentication routes
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/register', name: 'Register', component: RegistrationPage },
  { path: '/reset-password', name: 'ResetPassword', component: ResetPasswordPage },

  // Community Recipe Detail route
  {
    path: '/community/recipe/:id',
    name: 'RecipeDetailPage',
    component: RecipeDetailPage,
    props: true,
    meta: { requiresAuth: true }
  },
  { path: '/community/:id/cook', name: 'CCookNow', component: CCookNow, 
    props: true ,// Enables passing params as props to the component
    meta: { requiresAuth: true } },

  // User profile-related routes
  { path: '/profile', name: 'ProfileSettings', component: ProfileSettingsPage, meta: { requiresAuth: true } },
  { path: '/logout', name: 'Logout', component: LogoutComponent, meta: { requiresAuth: true } }
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
