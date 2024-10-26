<template>
  <div class="recipe-list">
    <div class="search-filter-bar">
      <input v-model="searchQuery" placeholder="Search recipes or usernames..." />
    </div>
    <div class="recipe-cards">
      <RecipeCard
        v-for="recipe in filteredRecipes"
        :key="recipe.id"
        :recipe="recipe"
        @click="openRecipeDetails(recipe.id)"
      />
    </div>
    <button @click="goToPostRecipe" class="post-recipe-button">Post New Recipe</button>
  </div>
</template>

<script>
import RecipeCard from './CRecipeCard.vue';
import { getRecipes } from './CRecipeService';

export default {
  components: {
    RecipeCard,
  },
  data() {
    return {
      searchQuery: '',
      recipes: [],
    };
  },
  computed: {
    filteredRecipes() {
      return this.recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  methods: {
    openRecipeDetails(id) {
      this.$router.push(`/community/recipe/${id}`);
    },
    goToPostRecipe() {
      this.$router.push('/community/post-recipe');
    },
    async fetchRecipes() {
      this.recipes = await getRecipes();
    },
  },
  mounted() {
    this.fetchRecipes();
  },
};
</script>

<style scoped>
.post-recipe-button {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
}
.post-recipe-button:hover {
  background-color: #218838;
}
</style>
