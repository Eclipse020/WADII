<template>
  <div class="container">
    <h2 class="title">Recommended Recipes</h2>

    <!-- Search Bar for Ingredients -->
    <div class="search-bar">
      <label for="ingredientSearch">Search by Ingredients:</label>
      <input
        type="text"
        v-model="ingredientQuery"
        placeholder="Enter ingredients (comma separated)"
        id="ingredientSearch"
      />
    </div>

    <!-- Search Bar for Recipe Name -->
    <div class="search-bar">
      <label for="recipeSearch">Search by Recipe Name:</label>
      <input
        type="text"
        v-model="recipeNameQuery"
        placeholder="Enter recipe name"
        id="recipeSearch"
      />
    </div>

    <!-- Filter Options -->
    <div class="filters">
      <div class="filter-group">
        <label for="cuisine">Cuisine Type:</label>
        <select v-model="cuisine">
          <option value="">None</option>
          <option value="american">American</option>
          <option value="asian">Asian</option>
          <option value="british">British</option>
          <option value="caribbean">Caribbean</option>
          <option value="central europe">Central Europe</option>
          <option value="chinese">Chinese</option>
          <option value="eastern europe">Eastern Europe</option>
          <option value="french">French</option>
          <option value="greek">Greek</option>
          <option value="indian">Indian</option>
          <option value="italian">Italian</option>
          <option value="japanese">Japanese</option>
          <option value="korean">Korean</option>
          <option value="kosher">Kosher</option>
          <option value="mediterranean">Mediterranean</option>
          <option value="mexican">Mexican</option>
          <option value="middle eastern">Middle Eastern</option>
          <option value="nordic">Nordic</option>
          <option value="south american">South American</option>
          <option value="south east asian">South East Asian</option>
          <option value="world">World</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="diet">Diet Types:</label>
        <select v-model="diet">
          <option value="">None</option>
          <option value="balanced">Balanced</option>
          <option value="high-fiber">High-Fiber</option>
          <option value="high-protein">High-Protein</option>
          <option value="low-carb">Low-Carb</option>
          <option value="low-fat">Low-Fat</option>
          <option value="low-sodium">Low-Sodium</option>
        </select>
      </div>

      <div class="long-dropdown">
        <label for="health">Dietary Restrictions:</label>
        <select v-model="selectedHealthLabels">
          <option value="">None</option>
          <option value="alcohol-cocktail">Alcohol-Cocktail</option>
          <option value="alcohol-free">Alcohol-Free</option>
          <option value="celery-free">Celery-Free</option>
          <option value="crustacean-free">Crustacean-Free</option>
          <option value="dairy-free">Dairy-Free</option>
          <option value="dash">DASH</option>
          <option value="egg-free">Egg-Free</option>
          <option value="fish-free">Fish-Free</option>
          <option value="fodmap-free">FODMAP-Free</option>
          <option value="gluten-free">Gluten-Free</option>
          <option value="immuno-supportive">Immuno-Supportive</option>
          <option value="keto-friendly">Keto-Friendly</option>
          <option value="kidney-friendly">Kidney-Friendly</option>
          <option value="kosher">Kosher</option>
          <option value="low-potassium">Low Potassium</option>
          <option value="low-sugar">Low Sugar</option>
          <option value="lupine-free">Lupine-Free</option>
          <option value="mediterranean">Mediterranean</option>
          <option value="mollusk-free">Mollusk-Free</option>
          <option value="mustard-free">Mustard-Free</option>
          <option value="no-oil-added">No oil added</option>
          <option value="paleo">Paleo</option>
          <option value="peanut-free">Peanut-Free</option>
          <option value="pescatarian">Pescatarian</option>
          <option value="pork-free">Pork-Free</option>
          <option value="red-meat-free">Red-Meat-Free</option>
          <option value="sesame-free">Sesame-Free</option>
          <option value="shellfish-free">Shellfish-Free</option>
          <option value="soy-free">Soy-Free</option>
          <option value="sugar-conscious">Sugar-Conscious</option>
          <option value="sulfite-free">Sulfite-Free</option>
          <option value="tree-nut-free">Tree-Nut-Free</option>
          <option value="vegan">Vegan</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="wheat-free">Wheat-Free</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="meal">Meal Type:</label>
        <select v-model="meal">
          <option value="">All</option>
          <option value="breakfast">Breakfast</option>
          <option value="brunch">Brunch</option>
          <option value="lunch">Lunch/Dinner</option>
          <option value="snack">Snack</option>
          <option value="teatime">Teatime</option>
        </select>
      </div>

      <button @click="fetchRecipes" class="find-recipes">Find Recipes</button>
    </div>

    <!-- Recipe List -->
    <div class="recipe-list">
      <div v-for="recipe in recipes" :key="recipe.uri" class="recipe-card">
        <img :src="recipe.image" alt="Recipe Image" />
        <h3>{{ recipe.label }}</h3>
        <p>Ready in {{ recipe.totalTime }} minutes</p>
        <p>Diet Types: {{ recipe.dietLabels.join(', ') }}</p>
        <button @click="viewRecipe(recipe)" class="view-recipe">View Recipe</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      ingredientQuery: "",
      recipeNameQuery: "",
      recipes: [],
      cuisine: "",
      diet: "",
      selectedHealthLabels: "",
      meal: "",
    };
  },

  methods: {
    async fetchRecipes() {
      let query = this.ingredientQuery ? this.ingredientQuery : this.recipeNameQuery;
      let apiUrl = `https://api.edamam.com/search?q=${query}&app_id=fcbb645c&app_key=475ad8f07b669d07d1b4e5a021a100cc`;

      if (this.cuisine) apiUrl += `&cuisineType=${this.cuisine}`;
      if (this.diet) apiUrl += `&diet=${this.diet}`;
      if (this.selectedHealthLabels) apiUrl += `&health=${this.selectedHealthLabels}`;
      if (this.meal) apiUrl += `&mealType=${this.meal}`;

      try {
        const response = await axios.get(apiUrl);
        this.recipes = response.data.hits.map(hit => hit.recipe);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      } finally {
        this.ingredientQuery = "";
        this.recipeNameQuery = "";
      }
    },

    viewRecipe(recipe) {
      const recipeId = encodeURIComponent(recipe.uri);
      this.$router.push({
        name: 'RecipeDetails',
        params: { id: recipeId }
      });
    },
  }
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  font-family: 'Cursive', sans-serif; /* You can change to any cute font */
  font-size: 2.5em;
  color: #2e8b57; /* Darker green for the title */
  text-align: center;
  margin-bottom: 30px;
}

.search-bar {
  margin-bottom: 20px;
}

.search-bar label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
  color: #2e8b57; /* Darker text for contrast */
}

.search-bar input {
  width: 100%;
  padding: 12px;
  border: 2px solid #2e8b57; /* Darker green border */
  border-radius: 5px;
  font-size: 1em;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 30px;
}

.filter-group {
  flex: 1;
  min-width: 200px; /* Ensures dropdowns have some width */
  margin-right: 10px;
}

.long-dropdown {
  flex: 1;
  min-width: 300px; /* Extra width for long dropdown */
  margin-right: 10px;
}

.filters label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
  color: #2e8b57; /* Darker text for contrast */
}

.filters select {
  width: 100%;
  padding: 12px;
  border: 2px solid #2e8b57; /* Dark green border */
  border-radius: 5px; /* Round edges */
  background-color: white; /* White background for contrast */
  transition: border 0.3s, box-shadow 0.3s; /* Smooth transition for focus */
}

.filters select:focus {
  border: 2px solid #006400; /* Even darker green on focus */
  box-shadow: 0 0 5px rgba(0, 100, 0, 0.5); /* Soft glow on focus */
}

.find-recipes {
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  background-color: #2e8b57; /* Dark green button */
  color: white; /* White text */
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s; /* Smooth transition for hover */
}

.find-recipes:hover {
  background-color: #006400; /* Darker green on hover */
}

.recipe-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.recipe-card {
  display: flex;
  flex-direction: column; /* Align children in a column */
  justify-content: space-between; /* Space items evenly */
  border: 1px solid #d3d3d3;
  border-radius: 10px;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background-color: white;
  transition: transform 0.2s;
}

.recipe-card:hover {
  transform: scale(1.02);
}

.recipe-card img {
  width: 100%;
  height: auto;
}

.recipe-card h3 {
  font-size: 1.5em;
  margin: 15px;
  color: #2e8b57; /* Darker green for the recipe title */
}

.recipe-card p {
  margin: 10px;
  color: #333; /* Darker text color */
}

.recipe-ingredients {
  margin: 15px;
}

.recipe-ingredients h4 {
  margin-bottom: 10px;
  color: #2e8b57; /* Darker green for ingredients title */
}

.recipe-ingredients ul {
  list-style-type: disc;
  padding-left: 20px;
}

.view-recipe {
  background-color: #2e8b57; /* Darker green for button */
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  font-size: 1em;
}

.view-recipe:hover {
  background-color: #236d45; /* Slightly darker green on hover */
}

.find-recipes {
  background-color: #2e8b57; /* Darker green for button */
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.find-recipes:hover {
  background-color: #236d45; /* Slightly darker green on hover */
}
</style>