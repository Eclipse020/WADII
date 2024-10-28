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
import { getAuth } from "firebase/auth";

export default {
  name: 'RecipeTracker',
  data() {
    return {
      completedRecipes: [],
      currentUserId: null
    }
  },
  async created() {
    const auth = getAuth();
    this.currentUserId = auth.currentUser?.uid;
    if (this.currentUserId) {
      await this.loadCompletedRecipes();
    }
  },
  methods: {
    async loadCompletedRecipes() {
      try {
        const completedRecipesCollection = collection(db, `users/${this.currentUserId}/completedRecipes`);
        const snapshot = await getDocs(completedRecipesCollection);
        this.completedRecipes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error("Error loading completed recipes:", error);
      }
    },
    async addCompletedRecipe(recipe) {
      if (!this.currentUserId) return;

      try {
        // Check if recipe already exists for today
        const today = new Date().toLocaleDateString();
        const existingRecipe = this.completedRecipes.find(r => 
          r.label === recipe.label && r.completedDate === today
        );

        if (!existingRecipe) {
          const completedRecipe = {
            label: recipe.label,
            completedDate: today,
            recipeId: recipe.id || null,
            userId: this.currentUserId
          };

          // Add to Firestore
          const completedRecipesCollection = collection(db, `users/${this.currentUserId}/completedRecipes`);
          const docRef = await addDoc(completedRecipesCollection, completedRecipe);
          
          // Add to local state with Firestore ID
          this.completedRecipes.push({
            id: docRef.id,
            ...completedRecipe
          });
          
          console.log("Recipe successfully added to completed recipes");
        } else {
          console.log("Recipe already marked as completed today");
        }
      } catch (error) {
        console.error("Error adding completed recipe:", error);
      }
    }
  }
}
</script>
