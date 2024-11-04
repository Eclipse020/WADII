<template>
  <div v-if="recipe" class="recipe-modal">
    <div class="recipe-modal__card">
      <div class="recipe-modal__body">
        <div class="recipe-modal__header">
          <h5 class="recipe-modal__title">Recipe Details 🥗🍳</h5>
          <button class="recipe-modal__close-btn" @click="close">X</button>
        </div>
        <hr />

        <div class="recipe-modal__info">
          <h3>{{ recipe.label }}</h3>
          
          <!-- Using the same image display code from AddRecipeModal -->
          <div class="recipe-preview-modal__image" v-if="recipe.image">
            <img :src="recipe.image" :alt="recipe.label" style="width: 300px; height: 300px; object-fit: cover; border-radius: 8px; margin: 15px 0;" />
          </div>

          <div class="recipe-modal__details">
            <div class="recipe-modal__nutrition">
              <h4>Nutrition:</h4>
              <p><strong>Calories:</strong> {{ Math.round(recipe.calories) }}</p>
              <p><strong>Servings:</strong> {{ recipe.yield }}</p>
              <h5>Nutrients per serving:</h5>
              <ul class="recipe-modal__nutrition-list">
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

            <div class="recipe-modal__ingredients">
              <h4>Ingredients:</h4>
              <div class="recipe-modal__list">
                <ul class="recipe-modal__ingredients-list">
                  <li
                    v-for="(ingredient, index) in recipe.ingredientLines"
                    :key="index"
                    class="recipe-modal__list-item"
                  >
                    {{ ingredient }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="recipe-modal__actions">
            <button class="recipe-modal__btn recipe-modal__btn--shopping" @click="addIngredients">
              Add to Shopping List
            </button>
            <button class="recipe-modal__btn recipe-modal__btn--completed" @click="goToCookingInstructions">
              Cooking Instructions
            </button>
            <button class="recipe-modal__btn recipe-modal__btn--delete" @click="deleteRecipe">
              Delete Recipe
            </button>
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
      this.$emit('delete-recipe', this.recipe, this.selectedRecipeIndex);
    },
    addIngredients() {
      this.$emit('add-to-shopping-list');
      alert("Ingredients added to the shopping list!");
    },
    goToCookingInstructions() {
      const encodedUri = encodeURIComponent(this.recipe.uri);
      this.$router.push({ 
        name: 'RecipeDetails',
        params: { id: encodedUri }
      });
      this.close();
    }
  }
};
</script>
