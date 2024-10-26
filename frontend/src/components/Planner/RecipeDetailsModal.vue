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
                <button class="delete-button" @click="deleteRecipe">Delete Recipe</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
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
        this.$emit('delete-recipe', this.day, this.selectedRecipeIndex);
      },
      addIngredients() {
        // Changed to emit add-to-shopping-list instead of add-ingredient
        this.$emit('add-to-shopping-list');
        alert("Ingredients added to the shopping list!");
      }
    }
  };
  </script>