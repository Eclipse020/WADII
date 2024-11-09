<template>
  <div class="tracker" :class="{ 'tracker--collapsed': isCollapsed }">
    <div class="tracker__card">
      <h4 class="tracker__title">Recipe Tracker</h4>
      <div class="tracker__stats">
        <p class="tracker__count">Total Recipes Cooked: {{ completedRecipes.length }}</p>
        <div v-if="topRecipes.length" class="tracker__top-recipes">
          <p class="tracker__top-recipes-title">Most Cooked:</p>
          <div class="tracker__top-recipes-list">
            <p v-for="(recipe, index) in topRecipes" 
               :key="index" 
               class="tracker__top-recipe">
              {{ recipe.label }} ({{ recipe.count }} times)
            </p>
          </div>
        </div>
      </div>
      <div class="tracker__list">
        <div class="tracker__header">
          <h4 class="tracker__subtitle">Completed Recipes:</h4>
        </div>
        <div class="tracker__filter">
          <div class="tracker__date-range">
            <div class="tracker__date-field">
              <label>From:</label>
              <input 
                type="date" 
                v-model="dateRange.start"
                :max="dateRange.end || today"
                class="tracker__date-input"
              />
            </div>
            <div class="tracker__date-field">
              <label>To:</label>
              <input 
                type="date" 
                v-model="dateRange.end"
                :min="dateRange.start"
                :max="today"
                class="tracker__date-input"
              />
            </div>
          </div>
        <button 
          @click="clearDateRange" 
          class="tracker__clear-btn"
          :disabled="!dateRange.start && !dateRange.end"
        >
          Clear
        </button>
      </div>
        <ul class="tracker__list-container">
          <li v-for="(recipe, index) in filteredRecipes"
              :key="index"
              class="tracker__item">
            {{ recipe.label }} - {{ recipe.completionDate }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "../../services/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default {
  name: 'RecipeTracker',
  emits: ['recipes-loaded'],
  data() {
    return {
      completedRecipes: [],
      currentUserId: null,
      dateRange: {
        start: null,
        end: null
      },
      isCollapsed: false,
      screenWidth: window.innerWidth
    }
  },
  created() {
    this.initializeTracker();
    window.addEventListener('resize', this.handleResize);
  },
  unmounted() {
    window.removeEventListener('resize', this.handleResize);
  },
  computed: {
    today() {
      return new Date().toISOString().split('T')[0];
    },
    filteredRecipes() {
      return this.getSortedRecipes(this.completedRecipes);
    },
    topRecipes() {
      const recipeCounts = this.completedRecipes.reduce((acc, recipe) => {
        acc[recipe.label] = (acc[recipe.label] || 0) + 1;
        return acc;
      }, {});

      // Convert to array of objects with label and count
      const recipeArray = Object.entries(recipeCounts)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);

      if (recipeArray.length === 0) return [];

      // Get the highest count
      const highestCount = recipeArray[0].count;
      
      // Return all recipes that have the highest count
      return recipeArray.filter(recipe => recipe.count === highestCount);
    }
  },
  methods: {
    getSortedRecipes(recipes) {
      if (!this.dateRange.start && !this.dateRange.end) {
        return recipes.slice().sort((a, b) => {
          // Parse the recipe completion dates
          const [aMonth, aDay, aYear] = a.completionDate.split('/');
          const [bMonth, bDay, bYear] = b.completionDate.split('/');
          const aDate = new Date(aYear, aMonth - 1, aDay);
          const bDate = new Date(bYear, bMonth - 1, bDay);

          // Sort in descending order (most recent first)
          return bDate.getTime() - aDate.getTime();
        });
      }

      // Rest of the filtering logic remains the same
      return this.filterRecipesByDateRange(recipes);
    },
    filterRecipesByDateRange(recipes) {
      return recipes.filter(recipe => {
        // Parse the recipe completion date
        const [month, day, year] = recipe.completionDate.split('/');
        const recipeDate = new Date(year, month - 1, day);
        recipeDate.setHours(0, 0, 0, 0);

        // Parse start date if exists
        let startDate = null;
        if (this.dateRange.start) {
          startDate = new Date(this.dateRange.start);
          startDate.setHours(0, 0, 0, 0);
        }

        // Parse end date if exists
        let endDate = null;
        if (this.dateRange.end) {
          endDate = new Date(this.dateRange.end);
          endDate.setHours(23, 59, 59, 999); // Set to end of day
        }

        // Apply date range filter
        if (startDate && endDate) {
          return recipeDate >= startDate && recipeDate <= endDate;
        } else if (startDate) {
          return recipeDate >= startDate;
        } else if (endDate) {
          return recipeDate <= endDate;
        }
        return true;
      });
    },
    clearDateRange() {
      this.dateRange.start = null;
      this.dateRange.end = null;
    },
    handleResize() {
      this.screenWidth = window.innerWidth;
      this.isCollapsed = this.screenWidth <= 768;
    },
    async initializeTracker() {
      const auth = getAuth();
      this.currentUserId = auth.currentUser?.uid;
      if (this.currentUserId) {
        await this.loadCompletedRecipes();
      }
      this.handleResize();
    },
    async loadCompletedRecipes() {
      try {
        const completedRecipesCollection = collection(db, `users/${this.currentUserId}/completedRecipes`);
        const snapshot = await getDocs(completedRecipesCollection);
        this.completedRecipes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Emit event after data is loaded
        this.$emit('recipes-loaded');
      } catch (error) {
        console.error("Error loading completed recipes:", error);
      }
    },
    async addCompletedRecipe(recipe) {
      if (!this.currentUserId) return;

      try {
        const today = new Date().toLocaleDateString();
        const existingRecipe = this.completedRecipes.find(r => 
          r.label === recipe.label && r.completionDate === today
        );

        if (!existingRecipe) {
          const completedRecipe = {
            label: recipe.label,
            completionDate: today,
            recipeId: recipe.id || null,
            userId: this.currentUserId
          };

          const completedRecipesCollection = collection(db, `users/${this.currentUserId}/completedRecipes`);
          const docRef = await addDoc(completedRecipesCollection, completedRecipe);

          this.completedRecipes.push({
            id: docRef.id,
            ...completedRecipe
          });

          // Emit event after adding new recipe
          this.$emit('recipes-loaded');
          console.log("Recipe successfully added to completed recipes");
        } else {
          console.log("Recipe already marked as completed today");
        }
      } catch (error) {
        console.error("Error adding completed recipe:", error);
      }
    }
  }
}
</script>