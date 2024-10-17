<template>
  <div>
    <h2>Recommended Recipes</h2>

    <!-- Filter Options -->
    <div class="filters">
      <label for="cuisine">Cuisine Type:</label>
      <select v-model="cuisine">
        <option value="">All</option>
        <option value="italian">Italian</option>
        <option value="mexican">Mexican</option>
        <option value="asian">Asian</option>
        <!-- Add more cuisines as needed -->
      </select>

      <label for="diet">Dietary Restrictions:</label>
      <select v-model="diet">
        <option value="">None</option>
        <option value="vegan">Vegan</option>
        <option value="gluten-free">Gluten-Free</option>
        <!-- Add more diets as needed -->
      </select>

      <button @click="fetchRecipes">Find Recipes</button>
    </div>

    <!-- Recipe List -->
    <div class="recipe-list">
      <div v-for="recipe in recipes" :key="recipe.id" class="recipe-card">
        <h3>{{ recipe.title }}</h3>
        <p>Ready in {{ recipe.readyInMinutes }} minutes</p>
        <button @click="viewRecipe(recipe.id)">View Recipe</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ingredients: [], // Gathered from the fridge
      recipes: [],
      cuisine: "",
      diet: "",
    };
  },
  mounted() {
    // When the component is loaded, collect the fridge items (ingredients)
    this.ingredients = this.$root.items.map(item => item.name); // Adjust based on your fridge data structure
  },
import axios from 'axios';

methods: {
  async fetchRecipes() {
    const apiUrl = `https://api.edamam.com/search?q=${this.ingredients.join(',')}&app_id=fcbb645c&app_key=475ad8f07b669d07d1b4e5a021a100cc`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      this.recipes = data.hits.map(hit => hit.recipe);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  }
}

    viewRecipe(id) {
      // Navigate to the detailed recipe page
      this.$router.push({ name: "RecipeDetails", params: { id } });
    },
  },
};
</script>

<style scoped>
/* Add some basic styling */
.recipe-list {
  display: flex;
  flex-wrap: wrap;
}
.recipe-card {
  border: 1px solid #ccc;
  padding: 1em;
  margin: 1em;
  width: 200px;
}
</style>
