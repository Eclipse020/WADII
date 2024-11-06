<template>
  <div class="recipe-details">
    <!-- Recipe Image with Full-Image Modal -->
    <div class="recipe-image-wrapper" @click="showFullImage = true">
      <img :src="recipe.image" alt="Recipe Image" class="recipe-image" v-if="recipe.image" />
    </div>
    <div v-if="showFullImage" class="modal-overlay" @click="showFullImage = false">
      <img :src="recipe.image" alt="Full Recipe Image" class="full-image" />
    </div>

    <!-- Recipe Details -->
    <h1>{{ recipe.name }}</h1>
    <p>{{ recipe.description }}</p>

    <!-- Additional Recipe Info -->
    <div class="additional-info">
      <p class="info-item">⏰ Estimated Time: {{ recipe.estimatedTime }} minutes</p>
      <p class="info-item">🍽️ Calories: {{ recipe.calories }}</p>
    </div>

    <!-- Ingredients List -->
    <h3>Ingredients</h3>
    <ul class="ingredients-list">
      <li v-for="ingredient in recipe.ingredients" :key="ingredient">{{ ingredient }}</li>
    </ul>

    <!-- Recipe Steps -->
    <h3>Steps</h3>
    <ol class="recipe-steps">
      <li v-for="(step, index) in recipe.steps" :key="index">{{ step }}</li>
    </ol>

    <!-- "Add to Favorites" Button -->
    <button @click="toggleFavorite" class="btn btn-success mx-2 shadow"
    :class="{'btn-success': !isFavorited, 'btn-secondary': isFavorited}">
      {{ isFavorited ? 'Added to Favorites' : 'Add to Favorites' }}
    </button>
    </div>
</template>

<script>
import { getRecipeById } from '@/services/RecipeService'; // Adjust path if necessary

export default {
  props: {
    recipeId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      showFullImage: false, // Controls the full-image modal display
      isFavorited: false, // Tracks if recipe is favorited
      recipe: {
        ingredients: [],
        steps: [] // Ensure steps are initialized as an array
      },
    };
  },
  methods: {
    async fetchRecipeDetails() {
      try {
        this.recipe = await getRecipeById(this.recipeId); // Use the passed recipeId prop

        // Split the steps string into an array by line breaks
        if (this.recipe.steps) {
          this.recipe.steps = this.recipe.steps.split('\n'); // Adjust delimiter if needed
        }
      } catch (error) {
        console.error("Failed to fetch recipe details:", error);
      }
    },
    toggleFavorite() {
      this.isFavorited = !this.isFavorited;
      }
  },
  mounted() {
    this.fetchRecipeDetails(); // Fetch details when component is mounted
  },
};
</script>

<style scoped>

.recipe-details {
  padding: 20px; /* Add padding */
  display: flex; /* Use flexbox for centering */
  flex-direction: column; /* Stack elements vertically */
  align-items: center; /* Center horizontally */
  text-align: center; /* Center text */
}

.recipe-image-wrapper {
  width: 100%; /* Set width to full width */
  height: auto; /* Adjust height automatically */
  overflow: hidden; /* Hide overflow to maintain crop */
  cursor: pointer;
  position: relative; /* Make it position relative for image styling */
}

.recipe-image {
  width: 100%; /* Use full width of the wrapper */
  height: auto; /* Maintain aspect ratio */
  object-fit: cover; /* Ensures the image covers the area without stretching */
  max-height: 300px; /* Set a maximum height to avoid it being too tall */
}

/* Additional Info Styling */
.additional-info {
  display: flex; /* Use flexbox for layout */
  justify-content: center; /* Center items horizontally */
  gap: 20px; /* Add spacing between items */
  margin: 20px 0; /* Add margin for spacing */
}

/* Ingredients List */
.ingredients-list {
  list-style-type: disc; /* Keep bullet points */
  padding-left: 20px; /* Add padding for bullets */
  margin: 20px 0; /* Add margin for spacing */
}

.ingredients-list li {
  font-size: 20px; /* Increase font size for ingredients */
  margin: 5px 0; /* Add margin for each ingredient */
  text-align: left; /* Align text to the left for better readability */
}

/* Recipe Steps */
.recipe-steps {
  list-style-position: outside; /* Keep the numbers/bullets outside */
  padding-left: 20px; /* Add padding for left alignment */
  margin: 0; /* Remove margin */
  font-size: 1.2em; /* Adjust font size as desired */
}

.recipe-steps li {
  margin: 5px 0; /* Optional: add some vertical spacing between steps */
  line-height: 1.4; /* Adjust line height for better readability */
  text-align: left; /* Align text to the left */
}


/* Full-screen modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  cursor: pointer;
}

.full-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.btn-success {
  background-color: #28a745; /* Green for 'Add to Favorites' */
}

.btn-secondary {
  background-color: #6c757d; /* Grey for 'Added to Favorites' */
}

</style>
