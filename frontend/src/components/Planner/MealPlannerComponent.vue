<template>
  <div class="meal-planner">
    <div class="left-column">
      <DayPlanPopup
        :show="showDayPlanPopup"
        :selectedDay="selectedDayText"
        :meals="selectedDayMeals"
        @close="closeDayPlanPopup"
        @add-recipe="handleAddRecipe"
        @clear-day="clearDayMeals"
        @delete-recipe="deleteRecipe"
      />
    </div>

    <div class="center-column">
      <h1>Meal Planner for {{ formattedMonthYear }}</h1>

      <div class="planner-controls">
        <button class="nav-button prev-button" @click="prevMonth">Previous</button>
        
        <div class="center-controls">
          <p v-if="selectedDay">Selected Day: {{ selectedDayText }}</p>
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
                @click="selectDay(day)"
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
      :meal-type="mealType"
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
import DayPlanPopup from './DayPlanPopup.vue';
import '@/styles/main.css';


export default {
  components: {
    AddRecipeModal,
    RecipeDetailsModal,
    ShoppingList,
    DayPlanPopup,
  },
  data() {
    return {
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth(),
      selectedDay: null,
      showRecipeModal: false,
      showRecipeDetails: false,
      showDayPlanPopup: false,
      selectedRecipe: null,
      selectedRecipeIndex: null,
      mealPlan: {},
      weekDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      shoppingList: [],
      currentUserId: null,
      availableIngredients: [],
      mealType: '',
      clickedDay: null,
    };
  },
  computed: {
    formattedMonthYear() {
      return new Date(this.currentYear, this.currentMonth).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    },
    selectedDayText() {
      if (!this.selectedDay) return '';
      const date = new Date(this.currentYear, this.currentMonth, this.selectedDay);
      return date.toLocaleDateString("en-US", { weekday: 'long' }) + ' ' + this.selectedDay;
    },
    selectedDayMeals() {
      return this.mealPlan[this.selectedDay] || [];
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
              mealType: mealData.mealType,
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
          mealType: this.mealType,
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
          mealType: this.mealType,
          createdAt: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error adding recipe:", error);
      }
      this.closeRecipeModal();
    },

    async deleteRecipe(recipe, index) {
      if (!this.currentUserId || !this.mealPlan[this.selectedDay]) return;

      try {
        if (recipe.id) {
          await deleteDoc(doc(db, `users/${this.currentUserId}/mealPlans`, recipe.id));
        }
        
        this.mealPlan[this.selectedDay].splice(index, 1);
        if (this.mealPlan[this.selectedDay].length === 0) {
          delete this.mealPlan[this.selectedDay];
        }
      } catch (error) {
        console.error("Error deleting recipe:", error);
      }
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
        const querySnapshot = await getDocs(collection(db, `users/${this.currentUserId}/shoppingList`));
        for (const doc of querySnapshot.docs) {
          await deleteDoc(doc.ref);
        }

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
      this.closeDayPlanPopup();
    },

    async fetchAvailableIngredients() {
      if (!this.currentUserId) return;
      
      try {
        const querySnapshot = await getDocs(collection(db, `users/${this.currentUserId}/fridge`));
        const ingredients = querySnapshot.docs.map(doc => doc.data().item);
        this.$refs.addRecipeModal.availableIngredients = ingredients;
      } catch (error) {
        console.error("Error fetching available ingredients:", error);
      }
    },

    selectDay(day) {
      if (!day) return;
      this.selectedDay = day;
      this.clickedDay = day;
      this.showDayPlanPopup = true;
    },

    handleAddRecipe(mealType) {
      this.mealType = mealType;
      this.showRecipeModal = true;
      this.showDayPlanPopup = false;
    },

    closeRecipeModal() {
      this.showRecipeModal = false;
      this.showDayPlanPopup = true;
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

    closeDayPlanPopup() {
      this.showDayPlanPopup = false;
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
  },
  mounted() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.currentUserId = user.uid;
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
