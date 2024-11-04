<template>
  <div class="post-recipe-container">
    <div class="card">
      <div class="card-header text-center">
        <h2>{{ isEditing ? 'Edit Recipe' : 'Post New Recipe' }}</h2>
      </div>
      <div class="card-body">
        <div class="post-recipe-form">
          <div class="mb-3">
            <input 
              type="file" 
              @change="onFileChange" 
              class="form-control" 
              accept="image/*" 
            />
          </div>
          <div class="mb-3">
            <input 
              v-model="recipe.name" 
              placeholder="Name of Recipe" 
              class="form-control" 
              required 
            />
          </div>
          <div class="row mb-3">
            <div class="col">
              <input 
                v-model="recipe.estimatedTime" 
                placeholder="Estimated Time (mins)" 
                type="number" 
                class="form-control" 
                required 
              />
            </div>
            <div class="col">
              <input 
                v-model="recipe.calories" 
                placeholder="Calories" 
                type="number" 
                class="form-control" 
                required 
              />
            </div>
          </div>
          <div class="mb-3">
            <textarea 
              v-model="recipe.description" 
              placeholder="Description" 
              class="form-control" 
              rows="3" 
              required 
            ></textarea>
          </div>
          <div class="mb-3">
            <textarea 
              v-model="recipe.ingredients" 
              placeholder="Ingredients (comma-separated)" 
              class="form-control" 
              rows="2"
              @input="handleIngredientInput(recipe.ingredients)"  
              required 
            ></textarea>
          </div>
          <div class="mb-3">
            <textarea 
              v-model="recipe.steps" 
              placeholder="Click Enter for a new step" 
              class="form-control" 
              rows="6" 
              required 
            ></textarea>
          </div>
          <div class="d-flex justify-content-center mt-3">
            <button 
              @click="postRecipe" 
              class="btn btn-success mx-2 shadow"
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
import { createRecipe, saveDraft } from '@/services/RecipeService'; // Import the functions

export default defineComponent({
  name: 'PostRecipeComponent',
  data() {
    return {
      recipe: {
        name: '',
        estimatedTime: null,
        calories: null,
        description: '',
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

    handleIngredientInput(ingredients) {
      // Convert comma-separated ingredients to an array
      this.recipe.ingredients = ingredients.split(',').map(ing => ing.trim());
    },

    async saveToDrafts() {
      try {
        await saveDraft(this.recipe); // Save the recipe as a draft
        console.log('Draft saved successfully');
      } catch (error) {
        console.error("Error saving draft:", error);
      }
    },

    async postRecipe() {
      try {
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

<style scoped>
/* Add any component-specific styles here */
</style>
