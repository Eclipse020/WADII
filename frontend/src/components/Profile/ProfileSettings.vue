<template>
  <div class="profile-container">
    <h2 class="profile-header">Profile Settings</h2>
    <form @submit.prevent="updateProfile">
      <div class="form-group">
        <label>Email: </label>
        <input type="email" v-model="user.email" class="form-control" readonly />
      </div>

      <div class="form-group">
        <label>Display Name: </label>
        <input type="text" v-model="user.displayName" class="form-control" required />
      </div>

      <div class="form-group">
        <label>Dietary Preferences (You may select multiple): </label>
        <div class="dietary-preferences">
          <label class="checkbox-inline">
            <input type="checkbox" value="vegetarian" v-model="user.dietaryPreferences" /> Vegetarian
          </label>
          <label class="checkbox-inline">
            <input type="checkbox" value="vegan" v-model="user.dietaryPreferences" /> Vegan
          </label>
          <label class="checkbox-inline">
            <input type="checkbox" value="gluten-free" v-model="user.dietaryPreferences" /> Gluten-Free
          </label>
          <label class="checkbox-inline">
            <input type="checkbox" value="none" v-model="user.dietaryPreferences" /> None
          </label>
        </div>
      </div>

      <div class="form-group">
        <label>Notification Preferences: </label>
        <div class="form-check">
          <input type="checkbox" v-model="user.notifications" class="form-check-input" id="notifications" />
          <label class="form-check-label" for="notifications">
            I would like to receive notifications!
          </label>
        </div>
      </div>

      <button type="submit" class="btn btn-primary">Update Profile</button>

      <!-- Success Message -->
      <div v-if="message" class="alert alert-success mt-3">{{ message }}</div>

      <!-- Error Message -->
      <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
    </form>
  </div>
</template>


<script>
import { db } from '../../services/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export default {
  data() {
    return {
      user: {
        email: '',
        displayName: '',
        dietaryPreferences: [], // Changed to an array for multiple selections
        notifications: false, // Default value
      },
      message: '',
      error: '',
    };
  },
  async created() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      this.user.email = user.email;
      // Fetch additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        this.user = { ...this.user, ...userDoc.data() };
      } else {
        console.error('No such document!');
      }
    } else {
      console.error('No user logged in');
      this.$router.push('/login');  // Redirect to login if no user
    }
  },
  methods: {
    async updateProfile() {
      this.message = '';
      this.error = '';
      const user = JSON.parse(localStorage.getItem('user'));
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          displayName: this.user.displayName,
          dietaryPreferences: this.user.dietaryPreferences, // Update as an array
          notifications: this.user.notifications, // Include notifications
        });
        this.message = 'Profile updated successfully!';
      } catch (error) {
        this.error = 'Error updating profile: ' + error.message;
      }
    },
  },
};
</script>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 20px auto;
  padding: 40px 20px;
  background-color: #f7f7f7;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.profile-header {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 30px;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  font-weight: bold;
  font-size: 1.1rem;
  color: #2c3e50;
}

.form-control {
  font-size: 1rem;
  padding: 10px;
}

.dietary-preferences {
  justify-content: center;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.checkbox-inline {
  display: flex;
  align-items: center;
}

.form-check {
  margin-top: 10px;
}

.form-check-label {
  margin-left: 10px;
  font-size: 1rem;
}

.alert {
  margin-top: 15px;
}

.btn-primary {
  background-color: #42b983;
  border-color: #42b983;
  padding: 10px 20px;
  font-size: 1.1rem;
}
</style>


