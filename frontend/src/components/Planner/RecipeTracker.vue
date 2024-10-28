<template>
  <div class="recipe-tracker">
    <div class="tracker-card">
      <h4>Recipe Tracker </h4>
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
// Import Firebase
import { db } from "../../services/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default {
  name: 'RecipeTracker',
  data() {
    return {
      completedRecipes: []
    }
  },
  async created() {
    // Load completed recipes from Firebase Firestore
    const completedRecipesCollection = collection(db, "completedRecipes");
    const snapshot = await getDocs(completedRecipesCollection);
    this.completedRecipes = snapshot.docs.map(doc => doc.data());
  },
  methods: {
    async addCompletedRecipe(recipe) {
      const completedRecipe = {
        ...recipe,
        completedDate: new Date().toLocaleDateString()
      };
      this.completedRecipes.push(completedRecipe);

      // Save to Firebase Firestore
      try {
        const completedRecipesCollection = collection(db, "completedRecipes");
        await addDoc(completedRecipesCollection, completedRecipe);
        console.log("Recipe successfully added to Firestore");
      } catch (error) {
        console.error("Error adding recipe: ", error);
      }
    }
  }
}
</script>
