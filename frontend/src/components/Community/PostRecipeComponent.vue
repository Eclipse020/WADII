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
              placeholder="Cooking Steps:
1. Wash potato
2. Peel potato etc." 
              class="form-control" 
              rows="6" 
              required 
            ></textarea>
          </div>
          <div class="d-flex justify-content-center mt-3">
            <button 
              @click="saveToDrafts" 
              class="btn btn-secondary mx-2 shadow"
            >
              {{ isEditing ? 'Update Draft' : 'Save to Drafts' }}
            </button>
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
import { ref, defineComponent } from 'vue';
import { createRecipe, saveDraft } from '@/services/RecipeService'; // Import the functions

export default defineComponent({
  name: 'PostRecipeComponent',
  setup() {
    const recipe = ref({
      name: '',
      estimatedTime: null,
      calories: null,
      description: '',
      ingredients: [],
      steps: ''
    });
    
    const isEditing = ref(false);

    const onFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        // Handle file upload logic here
        console.log('Selected file:', file);
      }
    };

    const handleIngredientInput = (ingredients) => {
      // Convert comma-separated ingredients to an array
      recipe.value.ingredients = ingredients.split(',').map(ing => ing.trim());
    };

    const saveToDrafts = async () => {
      try {
        await saveDraft(recipe.value); // Save the recipe as a draft
        console.log('Draft saved successfully');
      } catch (error) {
        console.error("Error saving draft:", error);
      }
    };

    const postRecipe = async () => {
      try {
        await createRecipe(recipe.value); // Post the recipe
        console.log('Recipe posted successfully');
        // Optionally reset the form or redirect
      } catch (error) {
        console.error("Error posting recipe:", error);
      }
    };

    return { recipe, isEditing, onFileChange, handleIngredientInput, saveToDrafts, postRecipe };
  }
});
</script>


<style scoped>
/* Add any component-specific styles here */
</style>
