// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { auth } from './services/firebase';
// import { auth, db } from './services/firebase';
// import { doc, getDoc } from 'firebase/firestore';

const app = createApp(App);

// Monitor auth state changes
// auth.onAuthStateChanged(async (user) => {
//   if (user) {
//     console.log('User is logged in:', user);
    
//     // Fetch user profile from Firestore
//     const userDoc = await getDoc(doc(db, 'users', user.uid));
//     if (userDoc.exists()) {
//       const userData = userDoc.data();
//       // You can store userData in a global state or Vuex store if needed
//       console.log('User profile:', userData);
//     }
//   } else {
//     console.log('No user logged in');
//     // Clear any user data if necessary
//   }
// });

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


app.use(router);
app.mount('#app');
