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
            <input type="checkbox" value="alcohol-free" v-model="user.dietaryPreferences" /> Alcohol-Free
          </label>
          <!-- <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="alcohol-cocktail" v-model="user.dietaryPreferences" /> Alcohol-Cocktail
          </label> -->
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="celery-free" v-model="user.dietaryPreferences" /> Celery-Free
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="crustacean-free" v-model="user.dietaryPreferences" /> Crustacean-Free
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="dairy-free" v-model="user.dietaryPreferences" /> Dairy-Free
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="dash" v-model="user.dietaryPreferences" /> DASH
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="egg-free" v-model="user.dietaryPreferences" /> Egg-Free
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="fish-free" v-model="user.dietaryPreferences" /> Fish-Free
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="fodmap-free" v-model="user.dietaryPreferences" /> FODMAP-Free
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="immuno-supportive" v-model="user.dietaryPreferences" /> Immuno-Supportive
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="keto-friendly" v-model="user.dietaryPreferences" /> Keto-Friendly
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="kidney-friendly" v-model="user.dietaryPreferences" /> Kidney-Friendly
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="kosher" v-model="user.dietaryPreferences" /> Kosher
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="low-potassium" v-model="user.dietaryPreferences" /> Low Potassium
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="low-sugar" v-model="user.dietaryPreferences" /> Low Sugar
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="lupine-free" v-model="user.dietaryPreferences" /> Lupine-Free
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="mediterranean" v-model="user.dietaryPreferences" /> Mediterranean
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="mollusk-free" v-model="user.dietaryPreferences" /> Mollusk-Free
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="mustard-free" v-model="user.dietaryPreferences" /> Mustard-Free
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="no-oil-added" v-model="user.dietaryPreferences" /> No oil added
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="paleo" v-model="user.dietaryPreferences" /> Paleo
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="peanut-free" v-model="user.dietaryPreferences" /> Peanut-Free
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="pescatarian" v-model="user.dietaryPreferences" /> Pescatarian
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="pork-free" v-model="user.dietaryPreferences" /> Pork-Free
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="red-meat-free" v-model="user.dietaryPreferences" /> Red-Meat-Free
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="sesame-free" v-model="user.dietaryPreferences" /> Sesame-Free
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="shellfish-free" v-model="user.dietaryPreferences" /> Shellfish-Free
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="soy-free" v-model="user.dietaryPreferences" /> Soy-Free
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="sugar-conscious" v-model="user.dietaryPreferences" /> Sugar-Conscious
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="sulfite-free" v-model="user.dietaryPreferences" /> Sulfite-Free
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="tree-nut-free" v-model="user.dietaryPreferences" /> Tree-Nut-Free
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="wheat-free" v-model="user.dietaryPreferences" /> Wheat-Free
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="vegetarian" v-model="user.dietaryPreferences" /> Vegetarian
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="vegan" v-model="user.dietaryPreferences" /> Vegan
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="gluten-free" v-model="user.dietaryPreferences" /> Gluten-Free
          </label>
          <!-- <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="balanced" v-model="user.dietaryPreferences" /> Balanced
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="high-fiber" v-model="user.dietaryPreferences" /> High-Fiber
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="high-protein" v-model="user.dietaryPreferences" /> High-Protein
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="low-carb" v-model="user.dietaryPreferences" /> Low-Carb
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="low-fat" v-model="user.dietaryPreferences" /> Low-Fat
          </label>
          <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="low-sodium" v-model="user.dietaryPreferences" /> Low-Sodium
          </label> -->
          <!-- <label class="profile-container__checkbox-inline">
            <input type="checkbox" value="none" v-model="user.dietaryPreferences" /> None
          </label> -->
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
