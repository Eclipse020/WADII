<template>
  <div v-if="show" class="recipe-modal">
    <div class="recipe-modal__card">
      <div class="recipe-modal__card-body">
        <div class="recipe-modal__card-title">
          <h5 class="recipe-modal__title">Add {{ mealType }} Recipe for {{ selectedDay }} {{ monthYear }} 🥗🍳</h5>
          <button @click="close" class="recipe-modal__btn-close btn btn-light">X</button>
        </div>
        <hr />

        <form @submit.prevent="searchRecipes">
          <div class="recipe-modal__form-group mb-3">
            <label class="recipe-modal__form-label" for="searchQuery">Search Recipes</label>
            <div class="recipe-modal__input-group d-flex">
              <input
                v-model="query"
                class="recipe-modal__input form-control me-2"
                type="text"
                id="searchQuery"
                placeholder="Enter recipe name or ingredients"
                required
              />
              <button type="submit" class="recipe-modal__btn-search btn btn-success">Search</button>
            </div>
          </div>

          <div v-if="validIngredients.length" class="recipe-modal__available-ingredients mt-3 d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center">
              <h6 class="recipe-modal__available-ingredients-title me-2">Available Ingredients:</h6>
              <ul class="recipe-modal__ingredient-list d-flex flex-wrap">
                <li v-for="(ingredient, index) in validIngredients" :key="index" class="recipe-modal__ingredient-item me-2">
                  <div class="form-check">
                    <input
                      type="checkbox"
                      :value="ingredient.name"
                      v-model="selectedIngredients"
                      :id="'ingredient-' + index"
                      class="recipe-modal__checkbox form-check-input"
                    />
                    <label
                      :for="'ingredient-' + index"
                      class="recipe-modal__checkbox-label form-check-label"
                      :style="{ color: isExpiringSoon(ingredient) ? '#dc3545' : 'inherit' }"
                    >
                      {{ ingredient.name }}
                    </label>
                  </div>
                </li>
              </ul>
            </div>
            <button type="button" class="recipe-modal__btn-use-ingredients btn btn-success" @click="useAvailableIngredients">Use Available Ingredients</button>
          </div>

          <!-- Updated Favorite Recipes Section -->
          <div v-if="favoriteRecipes.length" class="recipe-modal__favorites mt-4">
            <div class="recipe-modal__favorites-header" @click="toggleFavorites">
              <h6 class="recipe-modal__favorites-title">
                Your Favorite Recipes
                <i :class="['fas', showFavorites ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
              </h6>
            </div>
            <div v-if="showFavorites" class="recipe-modal__favorites-content">
              <div class="recipe-modal__recipe-list">
                <div v-for="recipe in favoriteRecipes" :key="recipe.id" class="recipe-modal__recipe-item">
                  <div class="d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start">
                      <span 
                        class="recipe-modal__recipe-label" 
                        :class="{ 'selected': selectedRecipe?.uri === recipe.uri }"
                        @click="selectFavoriteRecipe(recipe)"
                      >
                        {{ recipe.label }}
                      </span>
                      <button
                        class="recipe-modal__btn-add btn btn-success btn-sm"
                        @click.stop="addRecipe(recipe)"
                      >
                        Add
                      </button>
                    </div>
                    
                    <!-- Add Nutrition Information -->
                    <div class="recipe-modal__nutrition-info mt-2" v-if="recipe.totalNutrients">
                      <small class="text-muted d-block">
                        Calories: {{ Math.round(recipe.calories / (recipe.yield || 1)) }} per serving
                      </small>
                      <div class="d-flex gap-2 mt-1">
                        <small class="text-muted" v-if="recipe.totalNutrients.PROCNT">
                          Protein: {{ Math.round(recipe.totalNutrients.PROCNT.quantity / (recipe.yield || 1)) }}g
                        </small>
                        <small class="text-muted" v-if="recipe.totalNutrients.FAT">
                          Fat: {{ Math.round(recipe.totalNutrients.FAT.quantity / (recipe.yield || 1)) }}g
                        </small>
                        <small class="text-muted" v-if="recipe.totalNutrients.CHOCDF">
                          Carbs: {{ Math.round(recipe.totalNutrients.CHOCDF.quantity / (recipe.yield || 1)) }}g
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        <div class="recipe-modal__results mt-4">
          <h6 v-if="recipes.length > 0" class="recipe-modal__results-title mb-3">Search Results:</h6>
          <div v-if="recipes.length > 0" class="recipe-modal__recipe-list">
            <div v-for="recipe in recipes" :key="recipe.recipe.uri" class="recipe-modal__recipe-item">
              <div class="d-flex justify-content-between align-items-center">
                <span 
                  class="recipe-modal__recipe-label" 
                  :class="{ 'selected': selectedRecipe?.uri === recipe.recipe.uri }"
                  @click="selectRecipe(recipe.recipe)"
                >
                  {{ recipe.recipe.label }}
                </span>
                <button
                  class="recipe-modal__btn-add btn btn-success btn-sm"
                  @click.stop="addRecipe(recipe.recipe)"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
          <p v-else-if="hasSearched" class="recipe-modal__no-results text-center text-muted">
            No recipes found. Try a different search term.
          </p>
        </div>
      </div>
    </div>

    <!-- Recipe Preview Modal -->
    <div v-if="selectedRecipe" class="recipe-preview-modal">
      <div class="recipe-preview-modal__content">
        <div class="recipe-preview-modal__header">
          <h5 class="recipe-preview-modal__title">Recipe Preview 🥗🍳</h5>
          <button class="recipe-preview-modal__close-btn" @click="closePreview">X</button>
        </div>
        <hr />

        <div class="recipe-preview-modal__info">
          <h3>{{ selectedRecipe.label }}</h3>

          <!-- Added image display -->
          <div class="recipe-preview-modal__image" v-if="selectedRecipe.image">
            <img :src="selectedRecipe.image" :alt="selectedRecipe.label" style="width: 300px; height: 300px; object-fit: cover; border-radius: 8px; margin: 15px 0;" />
          </div>

          <div class="recipe-preview-modal__details">
            <div class="recipe-preview-modal__nutrition">
              <h4>Nutrition:</h4>
              <p><strong>Calories:</strong> {{ selectedRecipe.calories ? Math.round(selectedRecipe.calories) : 'N/A' }}</p>
              <p><strong>Servings:</strong> {{ selectedRecipe.yield || 'N/A' }}</p>
              <h5>Nutrients per serving:</h5>
              <ul class="recipe-preview-modal__nutrition-list">
                <li v-if="getNutrientValue('PROCNT')">
                  <i class="fas fa-drumstick-bite"></i> Protein: {{ getNutrientValue('PROCNT') }}g
                </li>
                <li v-if="getNutrientValue('FAT')">
                  <i class="fas fa-oil-can"></i> Fat: {{ getNutrientValue('FAT') }}g
                </li>
                <li v-if="getNutrientValue('CHOCDF')">
                  <i class="fas fa-bread-slice"></i> Carbs: {{ getNutrientValue('CHOCDF') }}g
                </li>
              </ul>
            </div>

            <div class="recipe-preview-modal__ingredients">
              <h4>Ingredients:</h4>
              <div class="recipe-preview-modal__list">
                <ul class="recipe-preview-modal__ingredients-list">
                  <li
                    v-for="(ingredient, index) in selectedRecipe.ingredientLines"
                    :key="index"
                    class="recipe-preview-modal__list-item"
                  >
                    {{ ingredient }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "../../services/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
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
    },
    mealType: {
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
      dietaryPreferences: '',
      selectedRecipe: null,
      favoriteRecipes: [],
      APP_ID: "fcbb645c",
      APP_KEY: "475ad8f07b669d07d1b4e5a021a100cc",
      BASE_URL: "https://api.edamam.com/api/recipes/v2",
      showFavorites: false,
    };
  },
  computed: {
    validIngredients() {
      const currentDate = new Date();
      return this.availableIngredients.filter(ingredient => {
        if (!ingredient.expiryDate) return true;
        const expiryDate = new Date(ingredient.expiryDate);
        return expiryDate >= currentDate;
      });
    }
  },
  watch: {
    show: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.fetchFridgeIngredients();
          this.fetchDietaryPreferences();
          this.fetchFavoriteRecipes();
        } else {
          this.selectedRecipe = null;
        }
      }
    }
  },
  methods: {
    getNutrientValue(nutrientType) {
      if (!this.selectedRecipe?.totalNutrients?.[nutrientType]?.quantity || !this.selectedRecipe?.yield || this.selectedRecipe.yield === 0) {
        return 'N/A';
      }
      return Math.round(this.selectedRecipe.totalNutrients[nutrientType].quantity / this.selectedRecipe.yield);
    },

    toggleFavorites() {
      this.showFavorites = !this.showFavorites;
    },
    
    selectRecipe(recipe) {
      this.selectedRecipe = recipe;
    },

    selectFavoriteRecipe(recipe) {
      // Process the favorite recipe to match the structure expected by the preview
      const processedRecipe = {
        ...recipe,
        totalNutrients: recipe.totalNutrients || {},
        yield: recipe.yield || 1,
        calories: recipe.calories || 0
      };
      this.selectedRecipe = processedRecipe;
    },

    closePreview() {
      this.selectedRecipe = null;
    },

    isExpiringSoon(ingredient) {
      if (!ingredient.expiryDate) return false;
      
      const expiryDate = new Date(ingredient.expiryDate);
      const currentDate = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
      
      return daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
    },

    async searchRecipes() {
      if (!this.query) return;

      let url = `${this.BASE_URL}?type=public&q=${this.query}&app_id=${this.APP_ID}&app_key=${this.APP_KEY}`;
      
      if (this.dietaryPreferences) {
        this.dietaryPreferences.forEach(pref => {
          url += `&health=${pref.toLowerCase()}`;
        });
      }

      try {
        const response = await fetch(url);
        const data = await response.json();
        this.recipes = data.hits;
        this.hasSearched = true;
        this.selectedRecipe = null;
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

    async fetchDietaryPreferences() {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("User is not authenticated");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          this.dietaryPreferences = userData.dietaryPreferences || [];
          console.log("Fetched dietary preferences:", this.dietaryPreferences);
        }
      } catch (error) {
        console.error("Error fetching dietary preferences:", error);
      }
    },

    async fetchFavoriteRecipes() {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("User is not authenticated");
        return;
      }

      try {
        const favoritesCollection = collection(db, `users/${user.uid}/favorites`);
        const snapshot = await getDocs(favoritesCollection);
        
        this.favoriteRecipes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log("Fetched favorite recipes:", this.favoriteRecipes);
      } catch (error) {
        console.error("Error fetching favorite recipes:", error);
      }
    },

    useAvailableIngredients() {
      if (this.selectedIngredients.length > 0) {
        this.query = this.selectedIngredients.join(", ");
        this.searchRecipes();
      }
    },

    addRecipe(recipe) {
      // Add meal type and ensure all required nutritional data is included
      console.log('Original recipe data:', recipe);
      console.log('Original totalNutrients:', recipe.totalNutrients);
      const processedRecipe = {
        ...recipe,
        mealType: this.mealType.toLowerCase(),
        // Ensure these properties exist even if they're null/empty
        calories: recipe.calories || 0,
        yield: recipe.yield || 1,
        // Single totalNutrients object with defaults for missing nutrients
        totalNutrients: {
          PROCNT: recipe.totalNutrients?.PROCNT || { quantity: 0, unit: 'g' },
          FAT: recipe.totalNutrients?.FAT || { quantity: 0, unit: 'g' },
          CHOCDF: recipe.totalNutrients?.CHOCDF || { quantity: 0, unit: 'g' },
          ...(recipe.totalNutrients || {})
        }
      };
      
      this.$emit('add-recipe', processedRecipe);
      this.selectedRecipe = null;
    },
    
    close() {
      this.$emit('close');
      this.query = '';
      this.recipes = [];
      this.availableIngredients = [];
      this.selectedIngredients = [];
      this.hasSearched = false;
      this.selectedRecipe = null;
    }
  }
};
</script>
