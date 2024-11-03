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
      <li v-for="recipe in filteredRecipes" :key="recipe.id" class="recipe-card" @click="openRecipeDetails(recipe.id)">
        <img :src="recipe.image" alt="Recipe Image" v-if="recipe.image" class="recipe-image" />
        <div class="recipe-content">
          <h3>{{ recipe.name }}</h3>
          <p><strong>Description:</strong> {{ recipe.description }}</p>
          <p><strong>Calories:</strong> {{ recipe.calories }}</p>
          <p><strong>Estimated Time:</strong> {{ recipe.estimatedTime }} mins</p>
          
          <!-- Like Functionality -->
          <div class="like-section">
            <button @click.stop="toggleLike(recipe)" :class="{ liked: recipe.isLiked }">
              ❤️ {{ recipe.likeCount }}
            </button>
          </div>

          <!-- Comment Functionality -->
          <div class="comment-section">
            <input v-model="recipe.newComment" placeholder="Add a comment..." />
            <button @click.stop="addComment(recipe)">Comment</button>
          </div>

          <!-- Display Comments -->
          <ul>
            <li v-for="(comment, index) in recipe.comments" :key="index">{{ comment }}</li>
          </ul>
        </div>
      </li>
    </ul>
    
    <!-- No results message -->
    <p v-if="filteredRecipes.length === 0 && searchQuery" class="no-results">
      No recipes found matching your search.
    </p>
  </div>
</template>

<script>
import { getRecipes, updateRecipeLikes, saveComment } from '@/services/RecipeService';

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
        this.recipes.forEach(recipe => {
          recipe.isLiked = false; // Initialize isLiked for each recipe
          recipe.newComment = ''; // Initialize newComment for each recipe
        });
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
    },
    openRecipeDetails(id) {
      this.$router.push({name: 'RecipeDetail', params: {id}});
    },
    async toggleLike(recipe) {
      recipe.isLiked = !recipe.isLiked;
      recipe.likeCount += recipe.isLiked ? 1 : -1;

      // Update the like count in your database
      await updateRecipeLikes(recipe.id, recipe.likeCount);
    },
    async addComment(recipe) {
      if (recipe.newComment.trim()) {
        recipe.comments.push(recipe.newComment);
        const commentToAdd = recipe.newComment; // Store comment to add to DB
        recipe.newComment = '';

        // Save the new comment in your database
        await saveComment(recipe.id, commentToAdd);
      }
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

.recipe-card {
  position: relative;
  margin: 1rem; /* Adjust the margin as needed */
  border: 1px solid #ccc; /* Optional: adds a border to the card */
  border-radius: 8px; /* Optional: rounded corners */
  overflow: hidden; /* Ensures child elements stay within the card bounds */
  height: 300px; /* Set a fixed height for the card */
}

.recipe-image {
  width: 100%; /* Make the image take the full width of the card */
  height: 50%; /* Make the image take the top half of the card */
  object-fit: cover; /* Crop the image to fit the container */
  object-position: center; /* Center the image */
}

.recipe-content {
  padding: 1rem; /* Adds padding around the content */
}

.like-section {
  margin: 10px 0;
}

.like-section button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  color: #e74c3c;
}

.like-section button.liked {
  color: #c0392b;
}

.comment-section {
  display: flex;
  align-items: center;
  margin: 10px 0;
}

.comment-section input {
  flex: 1;
  padding: 5px;
  margin-right: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.comment-section button {
  padding: 5px 10px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
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

/* Responsive design adjustments */
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
