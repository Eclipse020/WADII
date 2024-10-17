// src/router/index.js
import { auth } from '../services/firebase';
import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../pages/LoginPage.vue';
import RegistrationPage from '../pages/RegistrationPage.vue';
import HomePage from '../pages/HomePage.vue';
import ResetPasswordPage from '../pages/ResetPasswordPage.vue'; // Import Reset Password Page
import ProfileSettingsPage from '../pages/ProfileSettingsPage.vue'; // Import Profile Settings Page


const routes = [
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegistrationPage },
  { path: '/reset-password', component: ResetPasswordPage },
  { path: '/', component: HomePage, meta: { requiresAuth: true } },
  { path: '/settings', component: ProfileSettingsPage, meta: { requiresAuth: true } },
];

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
