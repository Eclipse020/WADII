<template>
  <div>
    <h2>{{ recipe.title }}</h2>
    <p>Ready in {{ recipe.readyInMinutes }} minutes</p>

    <h3>Ingredients</h3>
    <ul>
      <li v-for="ingredient in recipe.ingredients" :key="ingredient.id">
        <span :class="{ highlight: fridgeItems.includes(ingredient.name) }">{{ ingredient.name }}</span>
      </li>
    </ul>

    <h3>Instructions</h3>
    <ol>
      <li v-for="step in recipe.instructions" :key="step.number">{{ step.step }}</li>
    </ol>

    <button @click="cookNow">Cook Now</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      recipe: {},
      fridgeItems: []
    };
  },
  mounted() {
    this.fetchRecipeDetails();
    this.fridgeItems = this.$root.items.map(item => item.name);
  },
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
},
    cookNow() {
      console.log("Recipe cooked!");
    }
  }
};
</script>

<style scoped>
.highlight {
  color: green;
  font-weight: bold;
}
</style>
