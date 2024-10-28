<template>
  <div class="recipe-details">
  <div class="recipe-image-wrapper" @click="showFullImage = true">
    <img :src="recipe.image" alt="Recipe Image" class="recipe-image" v-if="recipe.image" />
  </div>
  <div v-if="showFullImage" class="modal-overlay" @click="showFullImage = false">
      <img :src="recipe.image" alt="Full Recipe Image" class="full-image" />
  </div>
    <h1>{{ recipe.name }}</h1>
    <p>{{ recipe.description }}</p>
    <h3>Ingredients</h3>
    <ul>
  <li v-for="ingredient in recipe.ingredients" :key="ingredient">{{ ingredient }}</li>
</ul>
    <h3>Steps</h3>
    <p>{{ recipe.steps }}</p>
    <p>Estimated Time: {{ recipe.estimatedTime }} minutes</p>
    <p>Calories: {{ recipe.calories }}</p>
    <button @click="cookNow">Cook Now</button>
  </div>
</template>

<script>
import { getRecipeById } from './CRecipeService';

export default {
  data() {
    return {
      showFullImage: false, // Controls the display of the full-screen image
      recipe: {
        ingredients: [],
      },
    };
  },
  
  methods: {
    async fetchRecipeDetails() {
      this.recipe = await getRecipeById(this.$route.params.id);
    },
    cookNow() {
      // Add logic to handle cooking action
    },
  },
  mounted() {
    this.fetchRecipeDetails();
  },
};
</script>

<style scoped>
.recipe-details {
  padding: 16px;
}
.recipe-image-wrapper {
  width: 100%;
  max-height: 300px; /* Adjust as needed */
  overflow: hidden;
  cursor: pointer;
}

.recipe-detail-image {
  width: 100%;
  height: auto;
  object-fit: cover; /* Show a cropped view similar to the card */
}

/* Full-screen modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7); /* Semi-transparent background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  cursor: pointer;
}

.full-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain; /* Ensures the whole image fits within the view */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}
</style>
