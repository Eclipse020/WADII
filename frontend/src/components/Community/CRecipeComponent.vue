<template>
  <div class="recipe-list">
    <div class="header-container">
      <!-- Search bar -->
      <div class="search-container">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search recipes by name or description..."
          class="search-input"
          @input="handleSearch" 
        />
      </div>
      
      <!-- Post New Recipe Button -->
      <button 
        class="post-recipe-btn"
        @click="navigateToPostRecipe"
      >
        <span class="btn-icon">+</span>
        Post New Recipe
      </button>
    </div>
    
    <h2>Recipes</h2>

    <!-- Error Message -->
    <p v-if="fetchError" class="error-message">{{ fetchError }}</p>

    <ul>
      <li v-for="recipe in filteredRecipes" :key="recipe.id">
        <h3>{{ recipe.name }}</h3>
        <p><strong>Description:</strong> {{ recipe.description }}</p>
        <p><strong>Calories:</strong> {{ recipe.calories }}</p>
        <p><strong>Estimated Time:</strong> {{ recipe.estimatedTime }} mins</p>
        <p><strong>Ingredients:</strong> {{ recipe.ingredients }}</p>
        <p><strong>Steps:</strong> {{ recipe.steps }}</p>
        <img :src="recipe.image" alt="Recipe Image" v-if="recipe.image" />
      </li>
    </ul>
    
    <!-- No results message -->
    <p v-if="filteredRecipes.length === 0 && searchQuery" class="no-results">
      No recipes found matching your search.
    </p>
  </div>
</template>

<script>
import { getRecipes } from '@/services/RecipeService';

export default {
  data() {
    return {
      recipes: [],
      searchQuery: '',
      fetchError: null
    };
  },
  async mounted() {
    await this.fetchRecipes();
  },
  methods: {
    async fetchRecipes() {
      try {
        this.recipes = await getRecipes();
      } catch (error) {
        console.error("Error fetching recipes:", error);
        this.fetchError = 'Failed to load recipes. Please try again later.';
      }
    },
    handleSearch() {
      // The search logic is handled in the computed property
    },
    navigateToPostRecipe() {
      this.$router.push({ name: 'PostRecipe' });
    }
  },
  computed: {
    filteredRecipes() {
      if (!this.searchQuery) return this.recipes;
      
      const query = this.searchQuery.toLowerCase();
      return this.recipes.filter(recipe => 
        recipe.name.toLowerCase().includes(query) ||
        recipe.description.toLowerCase().includes(query)
      );
    }
  }
};
</script>

<style scoped>
.recipe-list {
  padding: 20px;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.search-container {
  flex-grow: 1;
}

.search-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #666;
}

.post-recipe-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.post-recipe-btn:hover {
  background-color: #45a049;
  transform: translateY(-1px);
}

.post-recipe-btn:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 20px;
  font-weight: bold;
}

.recipe-list h2 {
  color: #333;
  margin: 20px 0;
}

.recipe-list ul {
  list-style-type: none;
  padding: 0;
}

.recipe-list li {
  border: 1px solid #ddd;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 5px;
  transition: transform 0.2s ease;
}

.recipe-list li:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.recipe-list img {
  max-width: 100px;
  border-radius: 5px;
}

.no-results {
  text-align: center;
  color: #666;
  padding: 20px;
  font-style: italic;
}

.error-message {
  color: red;
  text-align: center;
}

@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
  }
  
  .post-recipe-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
