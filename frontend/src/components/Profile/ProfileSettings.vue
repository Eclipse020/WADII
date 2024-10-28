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

        <!-- Conditional Rendering for Notification Customization -->
        <div class="notification-form" v-if="user.notifications">
          <div class="form-group">
            <label for="daysBeforeExpiry">Notify me before an item expires (in days):</label>
            <input type="number" v-model="notificationSettings.daysBeforeExpiry" class="form-control" min="1" max="30" required />
          </div>
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
        dietaryPreferences: [],
        notifications: false,
      },
      notificationSettings: {
        daysBeforeExpiry: 3,
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
        // Prepare the data to update
        const updateData = {
          displayName: this.user.displayName,
          dietaryPreferences: this.user.dietaryPreferences,
          notifications: this.user.notifications,
        };


        if (this.user.notifications) {
          updateData.notificationSettings = {
            daysBeforeExpiry: this.notificationSettings.daysBeforeExpiry,
          };
        }


        await updateDoc(doc(db, 'users', user.uid), updateData);
        this.message = 'Profile updated successfully!';
      } catch (error) {
        this.error = 'Error updating profile: ' + error.message;
      }
    },
 
  },
};
</script>


<style scoped>
/* Profile Settings Page CSS: Start */
.profile-container {
  max-width: 600px;
  margin: 20px auto;
  padding: 40px 20px;
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}


.profile-header {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 30px;
  color: #2c3e50;
}


.form-group {
  margin-bottom: 20px;
}


.form-group label {
  font-size: 16px;
  font-weight: 500;
  color: #555;
  margin-bottom: 8px;
  display: block;
  text-align: left;
}


.form-control {
  border-radius: 8px;
  border: 1px solid #ccc;
  padding: 10px;
  font-size: 15px;
  transition: border-color 0.3s ease;
  line-height: 1.6;
}


.form-control:focus {
  border-color: #007bff;
  box-shadow: none;
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


.btn-primary {
  background-color: #007bff;
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.3s ease;
}


.btn-primary:hover {
  background-color: #0056b3;
}


.btn-block {
  width: 100%;
  margin-top: 20px;
}

.alert {
  margin-top: 15px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .profile-container { padding: 20px; }
  .form-title { font-size: 22px; }
  .btn-primary { font-size: 14px; }
}
/* Profile Settings Page CSS: End */
</style>


