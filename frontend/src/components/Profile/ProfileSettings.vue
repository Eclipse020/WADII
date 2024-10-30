<template>
  <div class="profile-container">
    <h2 class="profile-container__header">Profile Settings</h2>
    <form @submit.prevent="updateProfile">
      <div class="profile-container__form-group">
        <label class="profile-container__label">Email:</label>
        <input type="email" v-model="user.email" class="profile-container__input" readonly />
      </div>

      <div class="profile-container__form-group">
        <label class="profile-container__label">Display Name:</label>
        <input type="text" v-model="user.displayName" class="profile-container__input" required />
      </div>

      <div class="profile-container__form-group">
        <label class="profile-container__label">Dietary Preferences (You may select multiple):</label>
        <div class="profile-container__dietary-preferences">
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="vegetarian" v-model="user.dietaryPreferences" /> Vegetarian
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="vegan" v-model="user.dietaryPreferences" /> Vegan
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="gluten-free" v-model="user.dietaryPreferences" /> Gluten-Free
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="none" v-model="user.dietaryPreferences" /> None
          </label>
        </div>
      </div>

      <div class="profile-container__form-group">
        <label class="profile-container__label">Notification Preferences:</label>
        <div class="profile-container__form-check">
          <input type="checkbox" v-model="user.notifications" class="form-check-input" id="notifications" />
          <label class="profile-container__form-check-label" for="notifications">
            I would like to receive notifications!
          </label>
        </div>

        <div class="notification-form" v-if="user.notifications">
          <div class="profile-container__form-group">
            <label class="profile-container__label" for="daysBeforeExpiry">Notify me before an item expires (in days):</label>
            <input type="number" v-model="notificationSettings.daysBeforeExpiry" class="profile-container__input" min="1" max="30" required />
          </div>
        </div>
      </div>

      <button type="submit" class="profile-container__button">Update Profile</button>

      <div v-if="message" class="profile-container__alert alert-success mt-3">{{ message }}</div>
      <div v-if="error" class="profile-container__alert alert-danger mt-3">{{ error }}</div>
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
/* BEM Format CSS for Profile Settings Page */
.profile-container {
  max-width: 600px;
  margin: 20px auto;
  padding: 40px 20px;
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.profile-container__header {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 30px;
  color: #42b983;
}

.profile-container__form-group {
  margin-bottom: 20px;
}

.profile-container__label {
  font-size: 16px;
  font-weight: 500;
  color: #555;
  margin-bottom: 8px;
  display: block;
  text-align: left;
}

.profile-container__input {
  border-radius: 8px;
  border: 1px solid #ccc;
  padding: 10px;
  font-size: 15px;
  transition: border-color 0.3s ease;
  line-height: 1.6;
  width: 100%;
}

.profile-container__input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

.profile-container__dietary-preferences {
  justify-content: center;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.profile-container__checkbox-inline {
  display: flex;
  align-items: center;
}

.profile-container__form-check {
  margin-top: 10px;
}

.profile-container__form-check-label {
  margin-left: 10px;
  font-size: 1rem;
}

.profile-container__button {
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.profile-container__button:hover {
  background-color: #42b983;
}

.profile-container__alert {
  margin-top: 15px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .profile-container { padding: 20px; }
  .profile-container__header { font-size: 22px; }
  .profile-container__button { font-size: 14px; }
}
</style>



