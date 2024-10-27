<template>
  <div v-if="recipe" class="recipe-modal">
    <div class="card">
      <div class="card-body">
        <div class="cardTitle">
          <h5 class="card-title">Recipe Details 🥗🍳</h5>
          <button class="btn btn-light btnClose" @click="close">X</button>
        </div>
        <hr />

        <div class="recipe-info">
          <h3>{{ recipe.label }}</h3>

          <div class="recipe-details">
            <div class="nutrition-column">
              <h4>Nutrition:</h4>
              <p><strong>Calories:</strong> {{ Math.round(recipe.calories) }}</p>
              <p><strong>Servings:</strong> {{ recipe.yield }}</p>
              <h5>Nutrients per serving:</h5>
              <ul>
                <li v-if="recipe.totalNutrients?.PROCNT">
                  <i class="fas fa-drumstick-bite"></i> Protein: {{ Math.round(recipe.totalNutrients.PROCNT.quantity / recipe.yield) }}g
                </li>
                <li v-if="recipe.totalNutrients?.FAT">
                  <i class="fas fa-oil-can"></i> Fat: {{ Math.round(recipe.totalNutrients.FAT.quantity / recipe.yield) }}g
                </li>
                <li v-if="recipe.totalNutrients?.CHOCDF">
                  <i class="fas fa-bread-slice"></i> Carbs: {{ Math.round(recipe.totalNutrients.CHOCDF.quantity / recipe.yield) }}g
                </li>
              </ul>
            </div>

            <div class="ingredients-column">
              <h4>Ingredients:</h4>
              <div class="recipe-list">
                <ul>
                  <li
                    v-for="(ingredient, index) in recipe.ingredientLines"
                    :key="index"
                    class="recipe-item"
                  >
                    {{ ingredient }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button class="add-to-shopping-list" @click="addIngredients">Add to Shopping List</button>
            <button class="completed-button" @click="markAsCompleted">Completed</button>
            <button class="delete-button" @click="deleteRecipe">Delete Recipe</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "../../services/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default {
  props: {
    recipe: {
      type: Object,
      required: true
    },
    day: {
      type: Number,
      required: true
    },
    monthYear: {
      type: String,
      required: true
    },
    selectedRecipeIndex: {
      type: Number,
      required: true
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },
    deleteRecipe() {
      this.$emit('delete-recipe', this.recipe, this.selectedRecipeIndex);
    },
    addIngredients() {
      this.$emit('add-to-shopping-list');
      alert("Ingredients added to the shopping list!");
    },
    async deleteIngredientsFromFridge() {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("User is not authenticated");
        return;
      }

      try {
        // Get all ingredients from the fridge
        const querySnapshot = await getDocs(collection(db, `users/${user.uid}/items`));
        const fridgeIngredients = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // For each recipe ingredient, check if it exists in the fridge
        for (const ingredientLine of this.recipe.ingredientLines) {
          const lowerIngredientLine = ingredientLine.toLowerCase();
          
          // Find matching fridge ingredients
          const matchingIngredients = fridgeIngredients.filter(fridgeItem => 
            lowerIngredientLine.includes(fridgeItem.name.toLowerCase())
          );

          // Delete matching ingredients from the fridge
          for (const ingredient of matchingIngredients) {
            await deleteDoc(doc(db, `users/${user.uid}/items`, ingredient.id));
          }
        }
      } catch (error) {
        console.error("Error deleting ingredients from fridge:", error);
      }
    },
    async markAsCompleted() {
      await this.deleteIngredientsFromFridge();
      this.$emit('recipe-completed', this.recipe);
      this.$emit('delete-recipe', this.recipe, this.selectedRecipeIndex);
      alert("Recipe marked as completed and ingredients removed from fridge!");
    }
  }
};
</script>
