<template>
  <div v-if="recipe && recipe.label"> 
    <h2>{{ recipe.label }}</h2>
    <p>Ready in {{ recipe.totalTime }} minutes</p>

    <h3>Ingredients</h3>
    <ul>
      <li v-for="ingredient in recipe.ingredientLines" :key="ingredient">
        <span :class="{ highlight: fridgeItems.includes(ingredient) }">{{ ingredient }}</span>
      </li>
    </ul>

    <h3>Cooking Instructions</h3>
    <p v-if="instructions">{{ instructions }}</p>
    <p v-else>Generating instructions...</p>

    <button @click="cookNow">Cook Now</button>
  </div>
  <div v-else>
    <p>Loading recipe details...</p>
  </div>
</template>

<script>
const { GoogleGenerativeAI } = require("@google/generative-ai");
import axios from 'axios';

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
        // Use the environment variable for API_KEY
        const genAI = new GoogleGenerativeAI(process.env.VUE_APP_API_KEY); 
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Create a dynamic prompt using recipe details
        const prompt = `Write step-by-step instructions for making ${this.recipe.label} using the following ingredients: ${this.recipe.ingredientLines.join(", ")}.`;

        const result = await model.generateContent(prompt);
        console.log(result.response.text());

        // Access the actual text from the response
        if (result && result.candidates && result.candidates.length > 0) {
        const instructionsContent = result.candidates[0].content.parts[0].text;
        this.instructions = instructionsContent; // Set this.instructions to display
      } else {
        this.instructions = "No instructions generated.";
      }

        console.log("Generated Instructions: ", this.instructions);
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

