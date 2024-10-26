import { createApp } from 'vue';
import App from './App.vue';
import './styles/main.css'; // Import global styles
import { auth } from './services/firebase';
import router from './router/index.js';

auth.onAuthStateChanged(user => {
  if (user) {
    console.log('User is logged in:', user);
    console.log('Logged in user:', user.email, user.uid, user.displayName);

    localStorage.setItem('user', JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    }));
  } else {
    console.log('No user logged in');
    localStorage.removeItem('user');
  }
});

const app = createApp(App);

app.config.globalProperties.items = []; // Define global property

app.use(router).mount('#app');