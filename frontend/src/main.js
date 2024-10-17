import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';

import List from './components/Recipes/List.vue';
import Details from './components/Recipes/Details.vue';

const routes = [
  { path: '/', component: List },
  { path: '/recipe/:id', name: 'RecipeDetails', component: Details }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.mount('#app');
