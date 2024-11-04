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
            <button 
              @click="clearDateRange" 
              class="tracker__clear-btn"
              :disabled="!dateRange.start && !dateRange.end"
            >
              Clear
            </button>
          </div>
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
      if (!this.dateRange.start && !this.dateRange.end) {
        return this.completedRecipes;
      }

      return this.completedRecipes.filter(recipe => {
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

<style scoped>
.tracker__filter {
  margin: 10px 0;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.tracker__date-range {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.tracker__date-field {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tracker__date-field label {
  font-weight: 500;
  color: #666;
}

.tracker__date-input {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
}

.tracker__clear-btn {
  padding: 6px 12px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.tracker__clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tracker__clear-btn:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.tracker__list-container {
  margin-top: 10px;
}
</style>
