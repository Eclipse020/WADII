<template>
  <div class="dashboard-summary">
    <h1 class="dashboard-summary__title">Your Dashboard</h1>
    <section class="dashboard-summary__section dashboard-summary__fridge-contents">
      <h2 class="dashboard-summary__section-title">Fridge Contents</h2>
      <ul class="dashboard-summary__list">
        <li class="dashboard-summary__item" v-for="item in fridgeContents" :key="item.id">{{ item.name }}</li>
      </ul>
    </section>
    <section class="dashboard-summary__section dashboard-summary__recipe-recommendations">
      <h2 class="dashboard-summary__section-title">Recommended Recipes</h2>
      <ul class="dashboard-summary__list">
        <li class="dashboard-summary__item" v-for="recipe in recommendedRecipes" :key="recipe.uri">
          {{ recipe.label }}
          <button class="dashboard-summary__button" @click="viewDetails(recipe)">View Details</button>
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
  .dashboard-summary {
    padding: 20px;
  }
  
  .dashboard-summary__title {
    color: #333;
  }
  
  .dashboard-summary__section {
    margin: 20px 0;
  }
  
  .dashboard-summary__section-title {
    color: #333;
  }
  
  .dashboard-summary__list {
    list-style-type: none;
    padding: 0;
  }
  
  .dashboard-summary__item {
    padding: 8px;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 5px;
    margin-bottom: 8px;
  }
  
  .dashboard-summary__button {
    margin-left: 10px;
    padding: 5px 10px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 3px;
    cursor: pointer;
  }
  
  .dashboard-summary__button:hover {
    background-color: #0056b3;
  }
</style>
  
  