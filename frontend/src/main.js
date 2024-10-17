// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { auth, db } from './services/firebase';
import { doc, getDoc } from 'firebase/firestore';

const app = createApp(App);

// Monitor auth state changes
auth.onAuthStateChanged(async (user) => {
  if (user) {
    console.log('User is logged in:', user);
    
    // Fetch user profile from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // You can store userData in a global state or Vuex store if needed
      console.log('User profile:', userData);
    }
  } else {
    console.log('No user logged in');
    // Clear any user data if necessary
  }
});

app.use(router);
app.mount('#app');
