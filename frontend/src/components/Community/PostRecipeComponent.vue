<template>
  <div class="post-recipe">
    <div class="post-recipe__card">
      <div class="post-recipe__card-header text-center">
        <h2>{{ isEditing ? 'Edit Recipe' : 'Post New Recipe' }}</h2>
      </div>
      <div class="post-recipe__card-body">
        <div class="post-recipe__form">
          <div class="post-recipe__input-group mb-3">
            <input 
              type="file" 
              @change="onFileChange" 
              class="post-recipe__file-input form-control" 
              accept="image/*" 
            />
          </div>
          <div class="post-recipe__input-group mb-3">
            <input 
              v-model="recipe.name" 
              placeholder="Name of Recipe" 
              class="post-recipe__input form-control" 
              required 
            />
          </div>
          <div class="row mb-3">
            <!-- Estimated Time Field -->
            <div class="col-md-6">
              <input 
                v-model="recipe.estimatedTime" 
                placeholder="Estimated Time (mins)" 
                type="number" 
                class="post-recipe__input form-control" 
                required 
              />
            </div>
            <!-- Calories Field -->
            <div class="col-md-6">
              <input 
                v-model="recipe.calories" 
                placeholder="Calories" 
                type="number" 
                class="post-recipe__input form-control" 
                required 
              />
            </div>
          </div>
          <div class="post-recipe__input-group mb-3">
            <textarea 
              v-model="recipe.ingredientsText" 
              placeholder="Ingredients (comma-separated)" 
              class="post-recipe__textarea form-control" 
              rows="2"
              required 
            ></textarea>
          </div>
          <div class="post-recipe__input-group mb-3">
            <textarea 
              v-model="recipe.steps" 
              placeholder="Recipe Steps: 
e.g. 
Boil water
Add noodles
Cook till soft" 
              class="post-recipe__textarea form-control" 
              rows="6" 
              required 
            ></textarea>
          </div>
          <div class="post-recipe__submit d-flex justify-content-center mt-3">
            <button 
              @click="postRecipe" 
              class="post-recipe__submit-btn btn btn-success mx-2 shadow"
            >
              {{ isEditing ? 'Update' : 'Post' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { createRecipe } from '@/services/RecipeService'; // Import the functions
import '../../styles/components/community/postrecipecomponent.css';


export default defineComponent({
  name: 'PostRecipeComponent',
  data() {
    return {
      recipe: {
        name: '',
        estimatedTime: null,
        calories: null,
        description: '',
        ingredientsText: '',
        ingredients: [],
        steps: '',
        image: ''
      },
      isEditing: false,
    };
  },
  methods: {
    onFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this.recipe.image = reader.result; // Store the base64 string in the recipe object
        };
        reader.readAsDataURL(file); // Read the image file as a data URL
      }
    },

    // Call this method when you save or post the recipe
    processIngredients() {
      // Split the ingredientsText by commas and trim each ingredient
      this.recipe.ingredients = this.recipe.ingredientsText
        .split(',')
        .map(ingredient => ingredient.trim())
        .filter(ingredient => ingredient); // Filters out empty strings
    },

    async postRecipe() {
      try {
        this.processIngredients();
        await createRecipe(this.recipe); // Post the recipe
        console.log('Recipe posted successfully');
        this.$router.push('/community'); // Redirect to the community page
      } catch (error) {
        console.error("Error posting recipe:", error);
      }
    },
  },
});
</script>
