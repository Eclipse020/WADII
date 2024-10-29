<template>
  <div class="page-container">
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
            <!-- Add other cuisines -->
          </select>
        </div>

        <div class="filter-group">
          <label for="diet">Diet Types:</label>
          <select v-model="diet">
            <option value="">None</option>
            <option value="balanced">Balanced</option>
            <!-- Add other diet types -->
          </select>
        </div>

        <div class="long-dropdown">
          <label for="health">Dietary Restrictions:</label>
          <select v-model="selectedHealthLabels">
            <option value="">None</option>
            <option value="alcohol-cocktail">Alcohol-Cocktail</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="gluten-free">Gluten-Free</option>
            <!-- Add all relevant options -->
          </select>
        </div>

        <div class="filter-group">
          <label for="meal">Meal Type:</label>
          <select v-model="meal">
            <option value="">All</option>
            <option value="breakfast">Breakfast</option>
            <!-- Add other meal types -->
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

    <!-- Pagination at the bottom -->
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
      <span>Page {{ currentPage }}</span>
      <button @click="nextPage" :disabled="currentPage * recipesPerPage >= totalRecipes">Next</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import {db} from '../../services/firebase';
import { getAuth } from "firebase/auth";
import { collection, getDocs, getDoc, doc} from "firebase/firestore";

export default {
  data() {
    return {
      ingredientQuery: "",
      recipeNameQuery: "",
      recipes: [],
      cuisine: "",
      diet: "",
      selectedHealthLabels: "", // Now initialized for auto-selection
      meal: "",
      currentPage: 1,
      recipesPerPage: 12,
      totalRecipes: 0,
      items: []
    };
  },
  async created() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          this.selectedHealthLabels = userDoc.data().dietaryPreferences[0] || ""; // Auto-select the first preference
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    } else {
      console.error('No user logged in');
      this.$router.push('/login');
    }

    await this.getCurrentUserItems();
    await this.fetchRecipes2();
    
  },
  methods: {
    async getCurrentUserItems() {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("User is not authenticated");
        return;
      }

      try {
        const querySnapshot = await getDocs(collection(db, `users/${user.uid}/items`));
        this.items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log("Fridge items:", this.items);
        // If you need to process expiry dates or any additional logic, you can do that here
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    },
    async fetchRecipes() {
      let query = this.ingredientQuery ? this.ingredientQuery : this.recipeNameQuery;
      let from = (this.currentPage - 1) * this.recipesPerPage;
      let to = from + this.recipesPerPage;

      let apiUrl = `https://api.edamam.com/search?q=${query}&app_id=fcbb645c&app_key=475ad8f07b669d07d1b4e5a021a100cc&from=${from}&to=${to}`;

      if (this.cuisine) apiUrl += `&cuisineType=${this.cuisine}`;
      if (this.diet) apiUrl += `&diet=${this.diet}`;
      if (this.selectedHealthLabels) apiUrl += `&health=${this.selectedHealthLabels}`;

      if (this.meal) apiUrl += `&mealType=${this.meal}`;

      try {
        const response = await axios.get(apiUrl);
        this.recipes = response.data.hits.map(hit => hit.recipe);
        this.totalRecipes = response.data.count;
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    },

    async fetchRecipes2() {
      const ingredients = this.items.map(item => item.name).join(","); // Join item names as comma-separated string
      console.log(ingredients)
      const query = this.ingredientQuery ? this.ingredientQuery : ingredients;
      console.log(query)
      const from = (this.currentPage - 1) * this.recipesPerPage;
      const to = from + this.recipesPerPage;

      let apiUrl = `https://api.edamam.com/search?q=${query}&app_id=fcbb645c&app_key=475ad8f07b669d07d1b4e5a021a100cc&from=${from}&to=${to}`;

      if (this.selectedHealthLabels) apiUrl += `&health=${this.selectedHealthLabels}`;

      try {
        const response = await axios.get(apiUrl);
        this.recipes = response.data.hits.map(hit => hit.recipe);
        this.totalRecipes = response.data.count;
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    },

    nextPage() {
      if (this.currentPage * this.recipesPerPage < this.totalRecipes) {
        this.currentPage++;
        this.fetchRecipes();
      }
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.fetchRecipes();
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
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* Full viewport height */
}

.container {
  flex: 1; /* This allows the container to take up all available space */
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
  justify-content: space-between; /* Space items within the card */
  border: 2px solid #2e8b57; /* Dark green border */
  border-radius: 10px;
  padding: 15px;
  background-color: #f9f9f9; /* Light background for cards */
  transition: transform 0.2s; /* Smooth transition for hover effect */
}

.recipe-card:hover {
  transform: scale(1.05); /* Scale up on hover for emphasis */
}

.recipe-card img {
  width: 100%; /* Make images responsive */
  border-radius: 5px; /* Round edges of images */
}

.recipe-card h3 {
  color: #2e8b57; /* Darker green for headings */
  font-size: 1.5em;
  margin: 10px 0; /* Space above and below */
}

.view-recipe {
  padding: 10px;
  border: none;
  border-radius: 5px;
  background-color: #2e8b57; /* Dark green button */
  color: white; /* White text */
  cursor: pointer;
  transition: background 0.3s; /* Smooth transition for hover */
}

.view-recipe:hover {
  background-color: #006400; /* Darker green on hover */
}

/* Pagination styles */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.pagination button {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  background-color: #2e8b57; /* Dark green button */
  color: white; /* White text */
  cursor: pointer;
  margin: 0 10px; /* Space between buttons */
  transition: background 0.3s; /* Smooth transition for hover */
}

.pagination button:disabled {
  background-color: #ccc; /* Gray for disabled buttons */
  cursor: not-allowed; /* Change cursor for disabled */
}

.pagination button:hover:not(:disabled) {
  background-color: #006400; /* Darker green on hover */
}

</style>