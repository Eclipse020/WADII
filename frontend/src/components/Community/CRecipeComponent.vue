<template>
  <div class="recipe-list">
    <div class="header-container">
      <!-- Search bar and Post New Recipe Button -->
      <div class="search-container">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search recipes by name or description..."
          class="search-input"
        />
      </div>
      
      <button 
        class="post-recipe-btn"
        @click="navigateToPostRecipe"
      >
        <span class="btn-icon">+</span>
        Post New Recipe
      </button>
    </div>

     <!-- Sort by Likes Dropdown -->
    <div class="sort-container">
      <label for="sortOption">Sort by:</label>
      <select id="sortOption" v-model="sortOption">
        <option value="default">Default</option>
        <option value="likes">Most Liked</option>
      </select>
    </div>
    
    <h2>Recipes</h2>

    <p v-if="fetchError" class="error-message">{{ fetchError }}</p>

    <ul>
      <li v-for="recipe in sortedRecipes" :key="recipe.id" class="recipe-card" @click="navigateToRecipeDetail(recipe.id)">
        <img :src="recipe.image" alt="Recipe Image" v-if="recipe.image" class="recipe-image" />
        <div class="recipe-content">
          <h3>{{ recipe.name }}</h3>
          <p><strong>Calories:</strong> {{ recipe.calories }}</p>
          <p><strong>Estimated Time:</strong> {{ recipe.estimatedTime }} mins</p>
          
          <div class="interaction-section">
            <div class="like-section">
              <button @click.stop="toggleLike(recipe)" :class="{ liked: recipe.isLiked }">
                ❤️ {{ recipe.likeCount }}
              </button>
            </div>

            <button @click.stop="openCommentPopup(recipe)">
              💬 {{ recipe.comments ? recipe.comments.length : 0 }} Comments
            </button>
          </div>
        </div>
      </li>
    </ul>

    <!-- Comment Popup -->
    <CommentPopup 
      v-if="isCommentPopupOpen" 
      :comments="currentRecipeComments" 
      @close="isCommentPopupOpen = false" 
      @add-comment="addComment" 
      v-model="newComment" 
    />
    
    <p v-if="filteredRecipes.length === 0 && searchQuery" class="no-results">
      No recipes found matching your search.
    </p>
  </div>
</template>

<script>
import { getRecipes, updateRecipeLikes, saveComment } from '@/services/RecipeService';
import CommentPopup from '@/components/Community/CommentPopup.vue';

export default {
  components: {
    CommentPopup,
  },
  data() {
    return {
      recipes: [],
      searchQuery: '',
      fetchError: null,
      isCommentPopupOpen: false, // Track if the comment popup is open
      currentRecipeComments: [], // Store comments for the currently open recipe
      newComment: '', // For binding new comment input
      sortOption: 'default', 
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
          recipe.isLiked = false;
          recipe.newComment = '';
          recipe.likeCount = recipe.likeCount || 0;
          recipe.comments = recipe.comments || [];
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
     navigateToRecipeDetail(recipeId) {
    this.$router.push({ name: 'RecipeDetailPage', params: { id: recipeId } });
  },
    async toggleLike(recipe) {
      const wasLiked = recipe.isLiked;
      recipe.likeCount += recipe.isLiked ? 1 : -1;
      recipe.isLiked = !wasLiked; 
       

      try {
        await updateRecipeLikes(recipe.id, recipe.likeCount);
      } catch (error) {
        console.error("Error updating likes:", error);
        recipe.isLiked = wasLiked; 
        recipe.likeCount += wasLiked ? -1 : 1; 
      }
    },
    openCommentPopup(recipe) {
      this.currentRecipeComments = recipe.comments || []; // Load comments for the selected recipe
      this.isCommentPopupOpen = true; // Open the comment popup
    },
    async addComment(comment) {
      const recipe = this.recipes.find(r => r.comments === this.currentRecipeComments);
      if (recipe) {
        recipe.comments.push(comment);
        await saveComment(recipe.id, comment); // Save the comment in your database
      }
      this.newComment = ''; // Reset new comment input
    }
  },
  computed: {
    filteredRecipes() {
      if (!this.searchQuery) return this.recipes; // Return all recipes if no search query
      
      const query = this.searchQuery.toLowerCase(); // Normalize the search query
      return this.recipes.filter(recipe => 
        recipe.name.toLowerCase().includes(query) ||
        recipe.description.toLowerCase().includes(query)
      );
    },
    sortedRecipes() {
      const recipesToSort = this.filteredRecipes; // Use filtered recipes for sorting
      if (this.sortOption === 'likes') {
        return [...recipesToSort].sort((a, b) => b.likeCount - a.likeCount);
      }
      return recipesToSort;
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
  height: auto; /* Let the height adjust to content */
}

.recipe-image {
  width: 100%; /* Makes the image take the full width of the card */
  height: auto; /* Maintain aspect ratio */
  max-height: 200px; /* Set a max height for the image to control its vertical size */
  object-fit: cover; /* Ensures the image covers the area without distortion */
  border-radius: 8px; /* Optional: adds rounded corners to the image */
}

.recipe-content {
  padding: 1rem; /* Adds padding around the content */
  display: flex;
  flex-direction: column; /* Arrange child elements vertically */
  justify-content: space-between; /* Space out content to push the interaction section down */
}

.interaction-section {
  display: flex;
  align-items: center; /* Align items vertically center */
  gap: 10px; /* Adjust the gap between like button and comment section */
  margin-top: auto; /* Pushes the interaction section to the bottom */
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
