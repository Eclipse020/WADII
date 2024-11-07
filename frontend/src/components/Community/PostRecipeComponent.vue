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
              v-model="recipe.ingredients" 
              placeholder="Ingredients (comma-separated)" 
              class="post-recipe__textarea form-control" 
              rows="2"
              @input="handleIngredientInput(recipe.ingredients)"  
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
/* Block Styles */
.post-recipe {
  padding: 20px;
}

.post-recipe__card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.post-recipe__card-header {
  padding: 20px;
}

.post-recipe__card-body {
  padding: 20px;
}

.post-recipe__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Element Styles */
.post-recipe__input-group {
  margin-bottom: 16px;
}

.post-recipe__input {
  width: 100%;
}

.post-recipe__textarea {
  width: 100%;
  resize: none;
}

.post-recipe__file-input {
  padding: 10px;
}

/* Styling for number inputs */
.post-recipe__input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
  padding-right: 25px;
}

.post-recipe__submit {
  display: flex;
  justify-content: center;
}

.post-recipe__submit-btn {
  background-color: #28a745;
  color: #fff;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.post-recipe__submit-btn:hover {
  background-color: #218838;
}
</style>
