import { addCommunityRecipe, fetchCommunityRecipes, likeRecipe, addComment } from "../services/communityService";


export default {
  data() {
    return {
      recipes: [],
    };
  },
  async created() {
    this.recipes = await fetchCommunityRecipes();
  },
  methods: {
    async postRecipe() {
  // Split the ingredients string into an array using commas as separators
  this.recipe.ingredients = this.recipe.ingredients.split(',').map(ingredient => ingredient.trim());
  await createRecipe(this.recipe);
  this.$router.push('/community');
}
    async like(recipeId) {
      await likeRecipe(recipeId);
      this.recipes = await fetchCommunityRecipes(); // Refresh the recipe list
    },
    async comment(recipeId, comment) {
      await addComment(recipeId, comment);
      this.recipes = await fetchCommunityRecipes(); // Refresh the recipe list
    },
  },
};


<template>
  <div class="post-recipe-container">
    <h2 class="text-center mb-4">{{ isEditing ? 'Edit Recipe' : 'Post New Recipe' }}</h2>
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
</template>

<style scoped>
.post-recipe-container {
  background-color: white;
  color: black; /* White text for contrast */
  padding: 40px 20px; /* Padding around the container */
  border-radius: 15px; /* Rounded corners */
  max-width: 800px; /* Max width for larger screens */
  margin: auto; /* Center the container */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); /* Subtle shadow */
}

h2 {
  font-size: 2rem; /* Larger font size for the title */
  margin-bottom: 20px; /* Space below the title */
}

.form-control {
  border-radius: 8px; /* Rounded corners for inputs */
  border: 1px solid #ced4da; /* Light border */
}

.btn {
  border-radius: 20px; /* Rounded buttons */
  font-weight: bold; /* Bold button text */
  text-align: center;
}

.btn-secondary {
  background-color: #6c757d; /* Custom secondary color */
}

.btn-success {
  background-color: #28a745; /* Custom success color */
}

.shadow {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Soft shadow effect */
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 15px; /* Adjust the gap between the buttons */
}
</style>

<script>
import { createRecipe, saveDraft, getRecipeById } from './CRecipeService';

export default {
  data() {
    return {
      recipe: {
        name: '',
        estimatedTime: '',
        calories: '',
        description: '',
        ingredients: [],
        steps: '',
        image: '',
      },
      isEditing: false,
    };
  },
  methods: {
    async onFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this.recipe.image = reader.result; // Store the base64 string in the recipe object
        };
        reader.readAsDataURL(file); // Read the image file as a data URL
      }
    },    

    async fetchDraft(id) {
      const response = await getRecipeById(id);
      this.recipe = response;
      this.isEditing = true;
    },
    async saveToDrafts() {
      if (this.isEditing) {
        await saveDraft(this.recipe);
        this.$router.push('/community/drafts');
      } else {
        await saveDraft(this.recipe);
        this.$router.push('/community/drafts');
      }
    },
      handleIngredientInput(ingredientsCsv) {
    // Split the ingredients by commas and trim each one
    this.recipe.ingredients = ingredientsCsv.split(',').map(item => item.trim());
  },
    async postRecipe() {
      await createRecipe(this.recipe);
      this.$router.push('/community');
    },
  },
  mounted() {
    const draftId = this.$route.params.id;
    if (draftId) {
      this.fetchDraft(draftId);
    }
  },
};
</script>

<style scoped>
/* Add your styles here */
</style>
