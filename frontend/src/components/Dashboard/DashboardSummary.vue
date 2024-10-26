<template>
    <div class="summary">
      <h1>Your Dashboard</h1>
      <section class="fridge-contents">
        <h2>Fridge Contents</h2>
        <ul>
          <li v-for="item in fridgeContents" :key="item.id">{{ item.name }}</li>
        </ul>
      </section>
      <section class="recipe-recommendations">
        <h2>Recommended Recipes</h2>
        <ul>
          <li v-for="recipe in recommendedRecipes" :key="recipe.uri">
            {{ recipe.label }}
            <button @click="viewDetails(recipe)">View Details</button>
          </li>
        </ul>
      </section>
    </div>
  </template>
  
  <script>
  import { fetchFridgeContents, fetchRecommendedRecipes } from '../../services/api';
  
  export default {
    data() {
      return {
        fridgeContents: [],
        recommendedRecipes: [],
      };
    },
    methods: {
      async loadFridgeContents() {
        try {
          this.fridgeContents = await fetchFridgeContents();
        } catch (error) {
          console.error('Error fetching fridge contents:', error);
        }
      },
      async loadRecommendedRecipes() {
        try {
          this.recommendedRecipes = await fetchRecommendedRecipes();
        } catch (error) {
          console.error('Error fetching recommended recipes:', error);
        }
      },
      viewDetails(recipe) {
        this.$router.push({ name: 'RecipeDetails', params: { recipe } });
      },
    },
    mounted() {
      this.loadFridgeContents();
      this.loadRecommendedRecipes();
    },
  };
  </script>
  
  <style scoped>
  .summary {
    padding: 20px;
  }
  
  .fridge-contents,
  .recipe-recommendations {
    margin: 20px 0;
  }
  
  h1, h2 {
    color: #333;
  }
  </style>
  