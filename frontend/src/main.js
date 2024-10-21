import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Create the Vue app
const app = createApp(App);

// Attach Axios to the global Vue prototype if it's loaded from CDN
if (window.axios) {
  app.config.globalProperties.$axios = window.axios;
}

// Use the router
app.use(router);

// Mount the app
app.mount('#app');

