<template>
    <div v-if="show" class="recipe-modal">
      <div class="card">
        <div class="card-body">
          <div class="cardTitle">
            <h5 class="card-title">Add Recipe for {{ selectedDay }} {{ monthYear }} 🥗🍳</h5>
            <button @click="close" class="btn btn-light btnClose">X</button>
          </div>
          <hr />
          
          <form @submit.prevent="searchRecipes">
            <div class="mb-3">
              <label class="form-label" for="searchQuery">Search Recipes</label>
              <div class="d-flex">
                <input 
                  v-model="query" 
                  class="form-control me-2" 
                  type="text" 
                  id="searchQuery" 
                  placeholder="Enter recipe name or ingredients"
                  required
                />
                <button type="submit" class="btn btn-success">Search</button>
              </div>
            </div>
  
            <div v-if="availableIngredients.length" class="mt-3 d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center">
                <h6 class="me-2">Available Ingredients:</h6>
                <ul class="ingredient-list d-flex flex-wrap">
                  <li v-for="(ingredient, index) in availableIngredients" :key="index" class="ingredient-item me-2">
                    <div class="form-check">
                      <input 
                        type="checkbox" 
                        :value="ingredient.name" 
                        v-model="selectedIngredients"
                        :id="'ingredient-' + index"
                        class="form-check-input"
                      />
                      <label :for="'ingredient-' + index" class="form-check-label">{{ ingredient.name }}</label>
                    </div>
                  </li>
                </ul>
              </div>
              <button type="button" class="btn btn-info" @click="useAvailableIngredients">Use Available Ingredients</button>
            </div>
          </form>
  
          <div class="recipe-results mt-4">
            <h6 v-if="recipes.length > 0" class="mb-3">Search Results:</h6>
            <div v-if="recipes.length > 0" class="recipe-list">
              <div v-for="recipe in recipes" :key="recipe.recipe.uri" class="recipe-item mb-2">
                <div class="d-flex justify-content-between align-items-center">
                  <span>{{ recipe.recipe.label }}</span>
                  <button 
                    class="btn btn-success btn-sm" 
                    @click="addRecipe(recipe.recipe)"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
            <p v-else-if="hasSearched" class="text-center text-muted">
              No recipes found. Try a different search term.
            </p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { db } from "../../services/firebase";
  import { collection, getDocs } from "firebase/firestore";
  import { getAuth } from "firebase/auth";
  
  export default {
    name: 'AddRecipeModal',
    props: {
      show: {
        type: Boolean,
        required: true
      },
      selectedDay: {
        type: [Number, null],
        required: true
      },
      monthYear: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        query: '',
        recipes: [],
        hasSearched: false,
        availableIngredients: [],
        selectedIngredients: [],
        APP_ID: "3293e008",
        APP_KEY: "715ffcc7f5922cd9e6cc3ab48549c216",
        BASE_URL: "https://api.edamam.com/api/recipes/v2"
      };
    },
    watch: {
      show: {
        immediate: true,
        handler(newVal) {
          if (newVal) {
            this.fetchFridgeIngredients();
          }
        }
      }
    },
    methods: {
      async searchRecipes() {
        if (!this.query) return;
  
        const url = `${this.BASE_URL}?type=public&q=${this.query}&app_id=${this.APP_ID}&app_key=${this.APP_KEY}`;
        try {
          const response = await fetch(url);
          const data = await response.json();
          this.recipes = data.hits;
          this.hasSearched = true;
        } catch (error) {
          console.error("Error fetching recipes:", error);
        }
      },
      
      async fetchFridgeIngredients() {
        const auth = getAuth();
        const user = auth.currentUser;
  
        if (!user) {
          console.error("User is not authenticated");
          return;
        }
  
        try {
          const querySnapshot = await getDocs(collection(db, `users/${user.uid}/items`));
          this.availableIngredients = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log("Fetched ingredients:", this.availableIngredients);
        } catch (error) {
          console.error("Error fetching available ingredients:", error);
        }
      },
  
      useAvailableIngredients() {
        if (this.selectedIngredients.length > 0) {
          this.query = this.selectedIngredients.join(", ");
          this.searchRecipes();
        }
      },
  
      addRecipe(recipe) {
        this.$emit('add-recipe', recipe);
      },
      
      close() {
        this.$emit('close');
        this.query = '';
        this.recipes = [];
        this.availableIngredients = [];
        this.selectedIngredients = [];
        this.hasSearched = false;
      }
    }
  };
  </script>