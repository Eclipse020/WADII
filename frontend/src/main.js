import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './styles/main.css'; // Import global styles
import { auth } from './services/firebase';

auth.onAuthStateChanged(user => {
  if (user) {
    console.log('User is logged in:', user);
    console.log('Logged in user:', user.email, user.uid, user.displayName); // Ensure this is correct for Google OAuth
    
    localStorage.setItem('user', JSON.stringify({
      uid: user.uid,  // Use the Google OAuth uid
      email: user.email,  // Use the Google OAuth email
      displayName: user.displayName,  // Optional: store displayName
      photoURL: user.photoURL  // Optional: store profile picture
    }));
  } else {
    console.log('No user logged in');
    localStorage.removeItem('user');
  }
});

createApp(App)
  .use(router)
  .mount('#app');

