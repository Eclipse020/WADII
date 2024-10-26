<template>
  <div class="meal-planner">
    <div class="left-column">
      <!-- Reserved for future component -->
      <RecipeTypeModal
      :show="showRecipeTypeModal"
      :selectedDay="selectedDay"
      @close="closeRecipeTypeModal"
      @meal-selected="handleMealSelected"
      @add-recipe="addRecipe"
      />
    </div>

    <div class="center-column">
      <h1>Meal Planner for {{ formattedMonthYear }}</h1>

      <div class="planner-controls">
        <button class="nav-button prev-button" @click="prevMonth">Previous</button>
        
        <div class="center-controls">
          <p v-if="selectedDay">Selected Day: {{ selectedDay }} {{ formattedMonthYear }}</p>
          <div v-if="selectedDay" class="button-group">
            <button class="add-recipe-button" @click="openRecipeModal">
              Add Recipe
            </button>
            <button 
              v-if="mealPlan[selectedDay] && mealPlan[selectedDay].length > 0"
              class="clear-day-button" 
              @click="clearDayMeals"
            >
              Clear Day
            </button>
          </div>
        </div>

        <button class="nav-button next-button" @click="nextMonth">Next</button>
      </div>

      <div class="calendar-wrapper">
        <table class="calendar-table">
          <thead>
            <tr>
              <th>Wk</th>
              <th v-for="day in weekDays" :key="day">{{ day }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(week, weekIndex) in calendar" :key="weekIndex">
              <td class="week-number">{{ weekIndex + 1 }}</td>
              <td
              v-for="(day, dayIndex) in week"
              :key="dayIndex"
              :class="['calendar-cell', { selected: day === selectedDay, today: isToday(day), 'clicked': clickedDay === day }]"
              @click="selectDay(day), openRecipeModal()"
            >
              <span v-if="day" class="date-number">{{ day }}</span>
              <div v-if="day && mealPlan[day]" class="meal-container">
                <div 
                  v-for="(meal, index) in mealPlan[day]" 
                  :key="meal.uri"
                  class="meal-item"
                  @click.stop="openRecipeDetails(meal, day, index)"
                  :title="meal.label"
                >
                  {{ meal.label }}
                </div>
              </div>
            </td>

            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="right-column">
      <ShoppingList 
        :ingredients="shoppingList" 
        @update="updateShoppingList" 
      />
    </div>

    <AddRecipeModal
      :show="showRecipeModal"
      :selected-day="selectedDay"
      :month-year="formattedMonthYear"
      @close="closeRecipeModal"
      @add-recipe="addRecipeToDay"
      @fetch-available-ingredients="fetchAvailableIngredients" 
    />

    <RecipeDetailsModal
      v-if="showRecipeDetails"
      :recipe="selectedRecipe"
      :day="selectedDay"
      :month-year="formattedMonthYear"
      :selected-recipe-index="selectedRecipeIndex"
      @close="closeRecipeDetails"
      @delete-recipe="deleteRecipe"
      @add-to-shopping-list="addToShoppingList"
    />
  </div>
</template>

<script>
import { onAuthStateChanged } from 'firebase/auth';
import { doc, collection, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import AddRecipeModal from './AddRecipeModal.vue';
import RecipeDetailsModal from './RecipeDetailsModal.vue';
import ShoppingList from './ShoppingList.vue';
import '@/styles/MealPlannerComponent.css';

export default {
  components: {
    AddRecipeModal,
    RecipeDetailsModal,
    ShoppingList,
  },
  data() {
    return {
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth(),
      selectedDay: null,
      showRecipeModal: false,
      showRecipeDetails: false,
      selectedRecipe: null,
      selectedRecipeIndex: null,
      mealPlan: {},
      weekDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      shoppingList: [],
      currentUserId: null,
      availableIngredients: [],
      showRecipeTypeModal: false,
      mealType: '', // to track selected meal type
    };
  },
  computed: {
    formattedMonthYear() {
      return new Date(this.currentYear, this.currentMonth).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    },
    calendar() {
      const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
      const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

      const weeks = [];
      let week = new Array(7).fill(null);

      for (let day = 1; day <= daysInMonth; day++) {
        const dayOfWeek = (firstDay + day - 1) % 7;
        week[dayOfWeek] = day;

        if (dayOfWeek === 6 || day === daysInMonth) {
          weeks.push(week);
          week = new Array(7).fill(null);
        }
      }

      return weeks;
    },
  },
  watch: {
    currentMonth: {
      handler: function() {
        this.loadMealPlan();
      }
    }
  },
  methods: {
    isToday(day) {
      const today = new Date();
      return day === today.getDate() && 
             this.currentMonth === today.getMonth() && 
             this.currentYear === today.getFullYear();
    },
    async loadMealPlan() {
      if (!this.currentUserId) return;
      
      try {
        console.log("Loading meal plan for month:", this.currentMonth);
        const querySnapshot = await getDocs(collection(db, `users/${this.currentUserId}/mealPlans`));
        this.mealPlan = {};
        
        querySnapshot.forEach((doc) => {
          const mealData = { id: doc.id, ...doc.data() };
          
          // Only process if we have valid day data and it matches current month/year
          if (mealData.day && 
              mealData.month === this.currentMonth && 
              mealData.year === this.currentYear) {
            
            if (!this.mealPlan[mealData.day]) {
              this.mealPlan[mealData.day] = [];
            }
            
            this.mealPlan[mealData.day].push({
              ...mealData.recipe,
              id: doc.id,
              day: mealData.day,
              month: mealData.month,
              year: mealData.year,
              createdAt: mealData.createdAt
            });
          }
        });
        
        console.log("Meal plan loaded:", this.mealPlan);
      } catch (error) {
        console.error("Error loading meal plan:", error);
      }
    },

    async loadShoppingList() {
      if (!this.currentUserId) return;
      
      try {
        const querySnapshot = await getDocs(collection(db, `users/${this.currentUserId}/shoppingList`));
        this.shoppingList = [];
        
        querySnapshot.forEach((doc) => {
          const itemData = { id: doc.id, ...doc.data() };
          this.shoppingList.push(itemData.item);
        });
        
        console.log("Shopping list loaded:", this.shoppingList);
      } catch (error) {
        console.error("Error loading shopping list:", error);
      }
    },

    async addRecipeToDay(recipe) {
      if (!this.currentUserId) return;

      try {
        const docRef = await addDoc(collection(db, `users/${this.currentUserId}/mealPlans`), {
          day: this.selectedDay,
          recipe: recipe,
          month: this.currentMonth,
          year: this.currentYear,
          createdAt: new Date().toISOString()
        });

        if (!this.mealPlan[this.selectedDay]) {
          this.mealPlan[this.selectedDay] = [];
        }
        this.mealPlan[this.selectedDay].push({
          ...recipe,
          id: docRef.id,
          day: this.selectedDay,
          month: this.currentMonth,
          year: this.currentYear,
          createdAt: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error adding recipe:", error);
      }
      this.closeRecipeModal();
    },

    async deleteRecipe(day, index) {
      if (!this.currentUserId || !this.mealPlan[day]) return;

      try {
        const recipeToDelete = this.mealPlan[day][index];
        if (recipeToDelete.id) {
          await deleteDoc(doc(db, `users/${this.currentUserId}/mealPlans`, recipeToDelete.id));
        }
        
        this.mealPlan[day].splice(index, 1);
        if (this.mealPlan[day].length === 0) {
          delete this.mealPlan[day];
        }
      } catch (error) {
        console.error("Error deleting recipe:", error);
      }
      this.closeRecipeDetails();
    },

    async addToShoppingList() {
      if (!this.currentUserId || !this.selectedRecipe || !this.selectedRecipe.ingredientLines) return;

      try {
        for (const ingredient of this.selectedRecipe.ingredientLines) {
          if (!this.shoppingList.includes(ingredient)) {
            await addDoc(collection(db, `users/${this.currentUserId}/shoppingList`), {
              item: ingredient,
              createdAt: new Date().toISOString()
            });
            this.shoppingList.push(ingredient);
          }
        }
      } catch (error) {
        console.error("Error adding to shopping list:", error);
      }
      this.closeRecipeDetails();
    },

    async updateShoppingList(newList) {
      if (!this.currentUserId) return;

      try {
        // Delete all existing items
        const querySnapshot = await getDocs(collection(db, `users/${this.currentUserId}/shoppingList`));
        for (const doc of querySnapshot.docs) {
          await deleteDoc(doc.ref);
        }

        // Add new items
        for (const item of newList) {
          await addDoc(collection(db, `users/${this.currentUserId}/shoppingList`), {
            item: item,
            createdAt: new Date().toISOString()
          });
        }

        this.shoppingList = newList;
      } catch (error) {
        console.error("Error updating shopping list:", error);
      }
    },

    async clearDayMeals() {
      if (!this.currentUserId || !this.selectedDay || !this.mealPlan[this.selectedDay]) return;

      try {
        const recipes = this.mealPlan[this.selectedDay];
        for (const recipe of recipes) {
          if (recipe.id) {
            await deleteDoc(doc(db, `users/${this.currentUserId}/mealPlans`, recipe.id));
          }
        }
        delete this.mealPlan[this.selectedDay];
      } catch (error) {
        console.error("Error clearing day meals:", error);
      }
    },

    async fetchAvailableIngredients() {
      if (!this.currentUserId) return;
      
      try {
        const querySnapshot = await getDocs(collection(db, `users/${this.currentUserId}/fridge`));
        const ingredients = querySnapshot.docs.map(doc => doc.data().item);
        this.$refs.addRecipeModal.availableIngredients = ingredients; // Update the available ingredients in the modal
      } catch (error) {
        console.error("Error fetching available ingredients:", error);
      }
    },

    selectDay(day) {
      this.selectedDay = day;
      this.clickedDay = day; 
      this.showRecipeTypeModal = true;
    },

    closeRecipeModal() {
      this.showRecipeModal = false;
    },

    openRecipeDetails(recipe, day, index) {
      this.selectedRecipe = recipe;
      this.selectedRecipeIndex = index;
      this.selectedDay = day;
      this.showRecipeDetails = true;
    },

    closeRecipeDetails() {
      this.showRecipeDetails = false;
      this.selectedRecipe = null;
      this.selectedRecipeIndex = null;
    },

    prevMonth() {
      if (this.currentMonth === 0) {
        this.currentYear -= 1;
        this.currentMonth = 11;
      } else {
        this.currentMonth -= 1;
      }
    },

    nextMonth() {
      if (this.currentMonth === 11) {
        this.currentYear += 1;
        this.currentMonth = 0;
      } else {
        this.currentMonth += 1;
      }
    },

    //For the pop-up
    closeRecipeTypeModal() {
      this.showRecipeTypeModal = false;
    },
    handleMealSelected(mealType) {
      this.mealType = mealType; // Save selected meal type
      this.openRecipeModal(); // Open the recipe modal to add a new recipe
    },
    openRecipeModal() {
      this.showRecipeModal = true;
    },
  },
  mounted() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.currentUserId = user.uid;
        // Load both meal plan and shopping list immediately after getting user ID
        Promise.all([
          this.loadMealPlan(),
          this.loadShoppingList()
        ]).catch(error => {
          console.error("Error loading data:", error);
        });
      } else {
        console.log("No user is signed in.");
        this.currentUserId = null;
        this.mealPlan = {};
        this.shoppingList = [];
      }
    });
  },
};
</script>