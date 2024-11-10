RecipeComponent
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
        const likedRecipes = JSON.parse(localStorage.getItem('likedRecipes')) || {};

        this.recipes.forEach(recipe => {
          // Set initial like state and count from localStorage
          recipe.isLiked = likedRecipes[recipe.id] || false;
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
      // Toggle the like state
      recipe.isLiked = !recipe.isLiked;
      recipe.likeCount += recipe.isLiked ? 1 : -1;

      try {
        // Update the like count on the server
        await updateRecipeLikes(recipe.id, recipe.likeCount);

        // Save the new like/unlike status in localStorage
        const likedRecipes = JSON.parse(localStorage.getItem('likedRecipes')) || {};
        likedRecipes[recipe.id] = recipe.isLiked;
        localStorage.setItem('likedRecipes', JSON.stringify(likedRecipes));
      } catch (error) {
        console.error("Error updating likes:", error);

        // Roll back changes if the update fails
        recipe.isLiked = !recipe.isLiked;
        recipe.likeCount += recipe.isLiked ? 1 : -1;
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
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.recipe-list__container {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* Header Section */
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1.5rem;
}

.search-container {
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  height: 56px;
}

.search-input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  outline: none;
}

.post-recipe-btn {
  padding: 1rem 1.5rem;
  height: 56px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.post-recipe-btn:hover {
  background-color: #2980b9;
}

.btn-icon {
  font-size: 1.25rem;
}

/* Sort Container */
.sort-container {
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sort-container label {
  font-weight: 600;
  color: #2c3e50;
}

.sort-container select {
  padding: 0.75rem 2.5rem 0.75rem 1.25rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background-color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%232c3e50' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1.25rem center;
}

/* Recipe Cards */
.recipe-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-bottom: 2rem;
  cursor: pointer;
}

.recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.recipe-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.recipe-content {
  padding: 1.5rem;
}

.recipe-content h3 {
  font-size: 1.25rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  font-weight: 600;
}

.recipe-content p {
  color: #666;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

/* Interaction Section */
.interaction-section {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.interaction-section button {
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 6px;
  background-color: #f8f9fa;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.interaction-section button:hover {
  background-color: #e9ecef;
}

.like-section button.liked {
  background-color: #e74c3c;
  color: white;
}

/* Error Messages */
.error-message {
  color: #e74c3c;
  text-align: center;
  padding: 1rem;
  background-color: #fdf1f0;
  border-radius: 8px;
  margin: 1rem 0;
}

.no-results {
  text-align: center;
  color: #666;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin: 1rem 0;
}

/* Comment Popup Styles */
.comment-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
  }
  
  .post-recipe-btn {
    width: 100%;
    justify-content: center;
  }
  
  .recipe-image {
    height: 200px;
  }
  
  .interaction-section {
    flex-direction: column;
  }
  
  .interaction-section button {
    width: 100%;
    justify-content: center;
  }
}

/* Recipe List */
ul {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

h2 {
  font-family: 'Poppins', sans-serif;
  font-size: 2.5rem;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}
</style>