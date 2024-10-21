<template>
  <div class="recipe-details">
    <img :src="recipe.image" alt="Recipe Image" class="recipe-image" />
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
      recipe: {},
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
.recipe-image {
  width: 100%;
  height: auto;
}
</style>
