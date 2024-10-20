import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './styles/main.css'; // Import global styles

createApp(App)
  .use(router)
  .mount('#app');
