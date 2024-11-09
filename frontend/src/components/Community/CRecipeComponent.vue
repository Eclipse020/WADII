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
import '../../styles/components/community/crecipecomponent.css';


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
