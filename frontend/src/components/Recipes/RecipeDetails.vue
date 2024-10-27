<template>
  <div v-if="recipe && recipe.label" class="recipe-container">
    <h2 class="recipe-title">{{ recipe.label }}</h2>
    <p class="recipe-time">Ready in <strong>{{ recipe.totalTime }}</strong> minutes</p>

    <h3>Ingredients</h3>
    <ul class="ingredient-list">
      <li v-for="ingredient in recipe.ingredientLines" :key="ingredient" class="ingredient-item">
        <span :class="{ highlight: fridgeItems.includes(ingredient) }">{{ ingredient }}</span>
      </li>
    </ul>

    <h3>Cooking Instructions</h3>
    <p v-if="instructions" class="instructions">{{ instructions }}</p>
    <p v-else class="loading-text">Generating instructions...</p>

    <div class="button-container">
      <button class="cook-now" @click="cookNow">Cook Now</button>
      <button class="add-favorites" @click="addToFavorites(recipe)">Add to Favorites</button>
    </div>
  </div>
  <div v-else>
    <p class="loading-text">Loading recipe details...</p>
  </div>
</template>

<script>
const { GoogleGenerativeAI } = require("@google/generative-ai");
import axios from 'axios';
import { getAuth } from 'firebase/auth';

export default {
  data() {
    return {
      recipe: {}, 
      fridgeItems: [],
      instructions: "", 
    };
  },
  mounted() {
    const recipeId = this.$route.params.id; 
    if (recipeId) {
      this.fetchRecipeById(recipeId); 
    } else {
      console.error("Recipe not found or invalid recipe data.");
    }
  },
  methods: {
    async fetchInstructions() {
      try {
        const genAI = new GoogleGenerativeAI(process.env.VUE_APP_API_KEY); 
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `Write step-by-step instructions for making ${this.recipe.label} using the following ingredients: ${this.recipe.ingredientLines.join(", ")}.`;

        const result = await model.generateContent(prompt);
        
        if (result && result.candidates && result.candidates.length > 0) {
          this.instructions = result.candidates[0].text || "No instructions available.";
        } else {
          this.instructions = "No instructions generated.";
        }
      } catch (error) {
        console.error("Error generating instructions:", error);
        this.instructions = "Error generating instructions.";
      }
    },
    async fetchRecipeById(recipeId) {
      try {
        const response = await axios.get(`https://api.edamam.com/search?r=${recipeId}&app_id=fcbb645c&app_key=475ad8f07b669d07d1b4e5a021a100cc`);
        if (response.data && response.data.length > 0) {
          this.recipe = response.data[0];
          await this.fetchInstructions(); 
        } else {
          console.error("Recipe not found.");
        }
      } catch (error) {
        console.error("Error fetching recipe by ID:", error);
      }
    },
    cookNow() {
      console.log("Recipe cooked!");
      // Additional logic for cooking can be implemented here
    },
    async addToFavorites(recipe) {
  try {
    const auth = getAuth(); // Get the Auth instance
    const user = auth.currentUser; // Get the currently signed-in user

    if (!user) {
      console.error("User is not authenticated.");
      return;
    }

    const token = await user.getIdToken(); // Get the ID token
    const response = await axios.get('http://localhost:8080/api/favorites', {
      headers: {
        Authorization: `Bearer ${token}` // Use the retrieved token
      }
    });

    const favorites = response.data.recipes || [];
    
    // Check if the recipe is already a favorite
    const isFavorite = favorites.some(fav => fav.uri === recipe.uri);
    if (isFavorite) {
      console.warn('Recipe is already in favorites');
      return; // Exit if it's already a favorite
    }

    await axios.put('http://localhost:8080/api/favorites', {
      recipes: [...favorites, recipe] // Include existing favorites plus the new one
    }, {
      headers: {
        Authorization: `Bearer ${token}` // Use the retrieved token
      }
    });

    console.log('Recipe added to favorites');
    // Optional: Show a success notification to the user
  } catch (error) {
    console.error('Error adding recipe to favorites:', error);
  }
}

  }
};
</script>

<style scoped>
.recipe-container {
  padding: 20px;
  background-color: #e8f5e9; /* Light green background for the recipe container */
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.recipe-title {
  font-family: 'Cursive', sans-serif; /* Aesthetic font for the title */
  color: #4a8c3a; /* Dark green */
  text-align: center;
  margin-bottom: 15px;
}

.recipe-time {
  text-align: center;
  font-size: 18px;
  margin-bottom: 20px;
}

.ingredient-list {
  list-style-type: none; /* Remove bullet points */
  padding: 0;
  display: flex;
  flex-direction: column; /* Stack items vertically */
  align-items: center; /* Center align the list items */
}

.ingredient-item {
  margin: 10px 0; /* Space between ingredients */
}

.highlight {
  color: #66bb6a; /* Light green for highlighted ingredients */
  font-weight: bold;
}

.instructions {
  background-color: #f1f8e9; /* Very light green for instruction background */
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.loading-text {
  text-align: center;
  font-style: italic;
  color: #777; /* Gray color for loading text */
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 15px; /* Space between buttons */
}

button {
  padding: 12px 20px;
  border-radius: 20px;
  border: none;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.cook-now {
  background-color: #4caf50; /* Medium green for cook now button */
  color: white; /* White text */
}

.cook-now:hover {
  background-color: #388e3c; /* Darker green on hover */
}

.add-favorites {
  background-color: #66bb6a; /* Light green for add to favorites button */
  color: white; /* White text */
}

.add-favorites:hover {
  background-color: #388e3c; /* Darker green on hover */
}
</style>
