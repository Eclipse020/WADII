<template>
  <div v-if="recipe && recipe.label" class="recipe-container">
    <h2 class="recipe-title">{{ recipe.label }}</h2>
    <p class="recipe-time">Ready in <strong>{{ recipe.totalTime }} minutes</strong></p>

    <h3>Ingredients</h3>
    <ul class="ingredient-list">
      <li v-for="(ingredient, index) in recipe.ingredientLines" :key="index" class="ingredient-item">
        <span :class="{ highlight: fridgeItems.includes(ingredient) }">{{ ingredient }}</span>
      </li>
    </ul>

    <h3>Instructions</h3>
    <div class="instructions" v-html="formattedInstructions"></div>

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
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export default {
  data() {
    return {
      recipe: {},
      fridgeItems: [],
      instructions: "",
      tips: [],
    };
  },
  computed: {
    formattedInstructions() {
      // Format instructions for display (replace newline with HTML line breaks)
      return this.instructions.split('\n').map(line => `<p>${line.trim()}</p>`).join('');
    },
    formattedTips() {
      // Return formatted tips for display
      return this.tips.map(tip => tip.trim());
    }
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
    async signInAndStoreToken(email, password) {
      const auth = getAuth();
      try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          const token = await user.getIdToken(true); // Force refresh of the token
          localStorage.setItem("token", token);
          console.log("Token saved to localStorage:", token);
      } catch (error) {
          console.error("Error signing in:", error);
      }
  },
    async fetchInstructions() {
      try {
        const genAI = new GoogleGenerativeAI(process.env.VUE_APP_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Write step-by-step instructions for making ${this.recipe.label} using the following ingredients: ${this.recipe.ingredientLines.join(", ")}.`;
        const result = await model.generateContent(prompt);
        
        if (result && result.response && result.response.candidates && result.response.candidates.length > 0) {
          this.instructions = result.response.candidates[0].content.parts[0].text || "No instructions available.";
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
      this.$router.push({ 
        name: 'CookNow', 
        params: { 
          recipe: this.recipe, 
          fridgeIngredients: this.fridgeItems 
        } 
      });
    },
    async addToFavorites(recipe) {
      const token = localStorage.getItem('firebaseToken'); // Use consistent token key
      console.log(token);
      try {
        const response = await axios.put('http://localhost:3000/api/favorites', {
          recipe // Send the recipe object to update favorites
        }, {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request header
          },
        });
        console.log('Favorites updated:', response.data.message); // Log the success message from the backend
      } catch (error) {
        console.error('Error adding to favorites:', error.response ? error.response.data : error.message);
        // Optionally, show a user-friendly message
      }
    }

  }
};
</script>

<style scoped>
.recipe-container {
  padding: 20px;
  background-color: #e8f5e9;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.recipe-title {
  font-family: 'Cursive', sans-serif;
  color: #4a8c3a;
  text-align: center;
  margin-bottom: 15px;
}

.recipe-time {
  text-align: center;
  font-size: 18px;
  margin-bottom: 20px;
}

.ingredient-list {
  list-style-type: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ingredient-item {
  margin: 10px 0;
}

.highlight {
  color: #66bb6a;
  font-weight: bold;
}

.instructions {
  background-color: #f1f8e9;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.tips-list {
  list-style-type: none; /* Remove bullet points for tips */
  padding: 0; /* Remove padding */
}

.tip-item {
  margin: 5px 0; /* Space between tips */
}

.loading-text {
  text-align: center;
  font-style: italic;
  color: #777;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 15px;
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
  background-color: #4caf50;
  color: white;
}

.cook-now:hover {
  background-color: #388e3c;
}

.add-favorites {
  background-color: #66bb6a;
  color: white;
}

.add-favorites:hover {
  background-color: #388e3c;
}
</style>
