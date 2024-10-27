<template>
  <div class="recipe-tracker">
    <div class="tracker-card">
      <h4>Recipe Tracker </h4>
      <!-- <i class="fas fa-pen-square"></i> -->
      <div class="tracker-stats">
        <p class="total-count">Total Recipes Cooked: {{ completedRecipes.length }}</p>
      </div>
      <div class="completed-recipes">
        <h4>Completed Recipes:</h4>
        <ul>
          <li v-for="(recipe, index) in completedRecipes" :key="index">
            {{ recipe.label }} - {{ recipe.completedDate }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecipeTracker',
  data() {
    return {
      completedRecipes: []
    }
  },
  created() {
    // Load completed recipes from localStorage
    const savedRecipes = localStorage.getItem('completedRecipes')
    if (savedRecipes) {
      this.completedRecipes = JSON.parse(savedRecipes)
    }
  },
  methods: {
    addCompletedRecipe(recipe) {
      const completedRecipe = {
        ...recipe,
        completedDate: new Date().toLocaleDateString()
      }
      this.completedRecipes.push(completedRecipe)
      // Save to localStorage
      localStorage.setItem('completedRecipes', JSON.stringify(this.completedRecipes))
    }
  }
}
</script>