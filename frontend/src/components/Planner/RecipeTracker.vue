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
          <div class="tracker__filter">
            <select v-model="timeFilter" class="tracker__select">
              <option value="all">All Time</option>
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
        <ul class="tracker__list-container">
          <li v-for="(recipe, index) in filteredRecipes"
              :key="index"
              class="tracker__item">
            {{ recipe.label }} - {{ recipe.completedDate }}
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
      timeFilter: 'all',
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
    filteredRecipes() {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

      return this.completedRecipes.filter(recipe => {
        const recipeDate = new Date(recipe.completedDate);
        switch (this.timeFilter) {
          case 'day':
            return recipeDate >= today;
          case 'week':
            return recipeDate >= weekAgo;
          case 'month':
            return recipeDate >= monthAgo;
          default:
            return true;
        }
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
          r.label === recipe.label && r.completedDate === today
        );

        if (!existingRecipe) {
          const completedRecipe = {
            label: recipe.label,
            completedDate: today,
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