<template>
  <div class="recipe-explorer">
    <div class="recipe-explorer__container">
      <h2 class="recipe-explorer__title">🥘 Recommended Recipes</h2>
      <!-- Fridge Ingredients Section -->
      <div class="search-block search-block--fridge">
        <label class="search-block__label" for="fridgeIngredientsSearch">🧊 Ingredients from Fridge:</label>
        <div class="search-block__dropdown-wrapper">
          <input 
            type="text" 
            id="fridgeIngredientsSearch"
            class="search-block__input"
            :value="selectedFridgeIngredients.join(', ')"
            @focus="showIngredientsDropdown = true"
            @blur="handleBlur"
            placeholder="Select ingredients (click to open)"
            readonly
          />
          <div 
            v-if="showIngredientsDropdown" 
            class="search-block__dropdown"
            @mousedown.prevent 
          >
            <label 
              v-for="item in items" 
              :key="item.id" 
              class="search-block__checkbox-label"
            >
              <input 
                type="checkbox" 
                :value="item.name"
                v-model="selectedFridgeIngredients"
                @change="updateIngredientsSearch"
                class="search-block__checkbox"
              />
              {{ item.name }}
            </label>
          </div>
        </div>
      </div>
      <!-- Search Sections -->
      <div class="search-block">
        <label class="search-block__label" for="ingredientSearch">🔍 Search by Ingredients:</label>
        <input
          type="text"
          v-model="ingredientQuery"
          placeholder="Enter ingredients (comma separated)"
          id="ingredientSearch"
          class="search-block__input"
        />
      </div>
      <div class="search-block">
        <label class="search-block__label" for="recipeSearch">📖 Search by Recipe Name:</label>
        <input
          type="text"
          v-model="recipeNameQuery"
          placeholder="Enter recipe name"
          id="recipeSearch"
          class="search-block__input"
        />
      </div>
      <!-- Filters Section -->
      <div class="filters-block">
        <div class="filters-block__group">
          <label class="filters-block__label" for="cuisine">🌎 Cuisine Type:</label>
          <select v-model="cuisine" class="filters-block__select">
            <option value="">None</option>
            <option value="american">American</option>
            <option value="asian">Asian</option>
            <option value="british">British</option>
            <option value="caribbean">Caribbean</option>
            <option value="central europe">Central Europe</option>
            <option value="chinese">Chinese</option>
            <option value="eastern europe">Eastern Europe</option>
            <option value="french">French</option>
            <option value="greek">Greek</option>
            <option value="indian">Indian</option>
            <option value="italian">Italian</option>
            <option value="japanese">Japanese</option>
            <option value="korean">Korean</option>
            <option value="kosher">Kosher</option>
            <option value="mediterranean">Mediterranean</option>
            <option value="mexican">Mexican</option>
            <option value="middle eastern">Middle Eastern</option>
            <option value="nordic">Nordic</option>
            <option value="south american">South American</option>
            <option value="south east asian">South East Asian</option>
            <option value="world">World</option>
          </select>
        </div>
        <div class="filters-block__group">
          <label class="filters-block__label" for="diet">🥗 Diet Types:</label>
          <select v-model="diet" class="filters-block__select">
            <option value="">None</option>
            <option value="balanced">⚖️ Balanced</option>
            <option value="high-fiber">🌾 High-Fiber</option>
            <option value="high-protein">🥩 High-Protein</option>
            <option value="low-carb">🥖 Low-Carb</option>
            <option value="low-fat">💪 Low-Fat</option>
            <option value="low-sodium">🧂 Low-Sodium</option>
          </select>
        </div>
        <div class="filters-block__group filters-block__group">
          <label class="filters-block__label" for="health">⚕️ Dietary Restrictions:</label>
          <select v-model="selectedHealthLabels" class="filters-block__select">
            <option value="">None</option>
            <option value="alcohol-cocktail">Alcohol-Cocktail</option>
            <option value="alcohol-free">Alcohol-Free</option>
            <option value="celery-free">Celery-Free</option>
            <option value="crustacean-free">Crustacean-Free</option>
            <option value="dairy-free">Dairy-Free</option>
            <option value="dash">DASH</option>
            <option value="egg-free">Egg-Free</option>
            <option value="fish-free">Fish-Free</option>
            <option value="fodmap-free">FODMAP-Free</option>
            <option value="gluten-free">Gluten-Free</option>
            <option value="immuno-supportive">Immuno-Supportive</option>
            <option value="keto-friendly">Keto-Friendly</option>
            <option value="kidney-friendly">Kidney-Friendly</option>
            <option value="kosher">Kosher</option>
            <option value="low-potassium">Low Potassium</option>
            <option value="low-sugar">Low Sugar</option>
            <option value="lupine-free">Lupine-Free</option>
            <option value="mediterranean">Mediterranean</option>
            <option value="mollusk-free">Mollusk-Free</option>
            <option value="mustard-free">Mustard-Free</option>
            <option value="no-oil-added">No oil added</option>
            <option value="paleo">Paleo</option>
            <option value="peanut-free">Peanut-Free</option>
            <option value="pescatarian">Pescatarian</option>
            <option value="pork-free">Pork-Free</option>
            <option value="red-meat-free">Red-Meat-Free</option>
            <option value="sesame-free">Sesame-Free</option>
            <option value="shellfish-free">Shellfish-Free</option>
            <option value="soy-free">Soy-Free</option>
            <option value="sugar-conscious">Sugar-Conscious</option>
            <option value="sulfite-free">Sulfite-Free</option>
            <option value="tree-nut-free">Tree-Nut-Free</option>
            <option value="vegan">Vegan</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="wheat-free">Wheat-Free</option>
          </select>
        </div>
        <div class="filters-block__group">
          <label class="filters-block__label" for="meal">🍽️ Meal Type:</label>
          <select v-model="meal" class="filters-block__select">
            <option value="">All</option>
            <option value="breakfast">🍳 Breakfast</option>
            <option value="brunch">🥪 Brunch</option>
            <option value="lunch">🥗 Lunch/Dinner</option>
            <option value="snack">🍿 Snack</option>
            <option value="teatime">☕ Teatime</option>
          </select>
        </div>
        <div class="filters-block__buttons">
          <button @click="fetchRecipes" class="filters-block__button filters-block__button--search">
            🔍 Find Recipes
          </button>
          <button @click="viewFavourites" class="filters-block__button filters-block__button--favorites">
            ❤️ View Favourites
          </button>
        </div>
      </div>
      <!-- Recipe Cards -->
      <div class="recipe-grid">
        <div v-for="recipe in recipes" :key="recipe.uri" class="recipe-card">
          <div class="recipe-card__image-container">
            <img :src="recipe.image" :alt="recipe.label" class="recipe-card__image"/>
          </div>
          <div class="recipe-card__content">
            <div class="recipe-card__info">
              <h3 class="recipe-card__title">{{ recipe.label }}</h3>
              <p class="recipe-card__time">⏱️ Ready in: {{ formatDuration(recipe.totalTime) }}</p>
              <p class="recipe-card__diet">🥗 Diet Types: {{ recipe.dietLabels.join(', ') || 'None' }}</p>
            </div>
            <button @click="viewRecipe(recipe)" class="recipe-card__button">
              👩‍🍳 View Recipe
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Pagination -->
    <div class="pagination">
      <button 
        @click="prevPage" 
        :disabled="currentPage === 1"
        class="pagination__button pagination__button--prev"
      >
        ◀️ Previous
      </button>
      <span class="pagination__text">Page {{ currentPage }}</span>
      <button 
        @click="nextPage" 
        :disabled="currentPage * recipesPerPage >= totalRecipes"
        class="pagination__button pagination__button--next"
      >
        Next ▶️
      </button>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
import {db} from '../../services/firebase';
import { getAuth } from "firebase/auth";
import { collection, getDocs, getDoc, doc} from "firebase/firestore";
export default {
  data() {
    return {
      ingredientQuery: "",
      recipeNameQuery: "",
      recipes: [],
      cuisine: "",
      diet: "",
      selectedHealthLabels: "", // Now initialized for auto-selection
      meal: "",
      currentPage: 1,
      recipesPerPage: 12,
      totalRecipes: 0,
      selectedFridgeIngredients: [],
      items: [],
      showIngredientsDropdown: false,
    };
  },
  async created() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          this.selectedHealthLabels = userDoc.data().dietaryPreferences[0] || ""; // Auto-select the first preference
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    } else {
      console.error('No user logged in');
      this.$router.push('/login');
    }
    await this.getCurrentUserItems();
    await this.fetchRecipes2();
    
  },
  methods: {
    handleBlur(event) {
      // Check if the related target is a checkbox
      if (event.relatedTarget && event.relatedTarget.type === 'checkbox') {
        return; // Don't close dropdown if clicking on a checkbox
      }
      
      // Close dropdown after a short delay
      setTimeout(() => {
        this.showIngredientsDropdown = false;
      }, 200);
    },
    updateIngredientsSearch() {
      console.log('Selected ingredients:', this.selectedFridgeIngredients);
      // Update ingredientQuery when fridge ingredients are selected
      this.ingredientQuery = this.selectedFridgeIngredients
        .map(ingredient => ingredient.trim())
        .join(',');
      console.log('Ingredient query:', this.ingredientQuery);
    },
    
    async getCurrentUserItems() {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.error("User is not authenticated");
        return;
      }
      try {
        const querySnapshot = await getDocs(collection(db, `users/${user.uid}/items`));
        this.items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log("Fridge items:", this.items);
        // If you need to process expiry dates or any additional logic, you can do that here
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    },
    async fetchRecipes() {
      // Use either manually entered ingredients or selected fridge ingredients
      let queryParts = [];
      if (this.recipeNameQuery) queryParts.push(this.recipeNameQuery);
      if (this.ingredientQuery) queryParts.push(this.ingredientQuery);
      if (this.selectedFridgeIngredients.length > 0) queryParts.push(this.selectedFridgeIngredients.join(' '));
      // Combine all parts into one query string, separated by spaces
      let query = queryParts.join(' ');
      let from = (this.currentPage - 1) * this.recipesPerPage;
      let to = from + this.recipesPerPage;
      let apiUrl = `https://api.edamam.com/search?q=${query}&app_id=fcbb645c&app_key=475ad8f07b669d07d1b4e5a021a100cc&from=${from}&to=${to}`;
      if (this.cuisine) apiUrl += `&cuisineType=${this.cuisine}`;
      if (this.diet) apiUrl += `&diet=${this.diet}`;
      if (this.selectedHealthLabels) apiUrl += `&health=${this.selectedHealthLabels}`;
      
      if (this.meal) apiUrl += `&mealType=${this.meal}`;
      try {
        const response = await axios.get(apiUrl);
        this.recipes = response.data.hits.map(hit => hit.recipe);
        this.totalRecipes = response.data.count;
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    },
    async fetchRecipes2() {
      const ingredients = this.items.map(item => item.name).join(","); // Join item names as comma-separated string
      console.log("the ingredients are" + ingredients)
      const query = this.ingredientQuery ? this.ingredientQuery : ingredients;
      console.log("the query is " + query)
      const from = (this.currentPage - 1) * this.recipesPerPage;
      const to = from + this.recipesPerPage;
      let apiUrl = `https://api.edamam.com/search?q=${query}&app_id=fcbb645c&app_key=475ad8f07b669d07d1b4e5a021a100cc&from=${from}&to=${to}`;
      if (this.selectedHealthLabels) apiUrl += `&health=${this.selectedHealthLabels}`;
      try {
        const response = await axios.get(apiUrl);
        this.recipes = response.data.hits.map(hit => hit.recipe);
        this.totalRecipes = response.data.count;
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    },
    nextPage() {
      if (this.currentPage * this.recipesPerPage < this.totalRecipes) {
        this.currentPage++;
        this.fetchRecipes();
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.fetchRecipes();
      }
    },
    viewRecipe(recipe) {
      const recipeId = encodeURIComponent(recipe.uri);
      this.$router.push({
        name: 'RecipeDetails',
        params: { id: recipeId }
      });
    },
    viewFavourites() {
      this.$router.push({ name: 'Favourites' });
    },
    formatDuration(minutes) {
      if (!minutes || minutes === 0) {
        return "Duration unavailable";
      }
      
      if (minutes < 60) {
        return `${minutes} minutes`;
      }
      
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      
      if (remainingMinutes === 0) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
      }
      
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes} ${remainingMinutes === 1 ? 'minute' : 'minutes'}`;
    },
  }
};
</script>
<style scoped>
.recipe-explorer {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
}
.recipe-explorer__container {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}
.recipe-explorer__title {
  font-family: 'Poppins', sans-serif;
  font-size: 2.5rem;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}
/* Search Block Styles */
.search-block {
  margin-bottom: 1.5rem;
  max-width: 100%;
}
.search-block__label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}
.search-block__input {
  width: 100%;
  padding: 1rem 1.25rem; /* Increased padding */
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  height: 56px; /* Increased height */
}
.search-block__input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  outline: none;
}
.search-block__dropdown-wrapper {
  position: relative;
}
.search-block__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}
.search-block__checkbox-label {
  display: block;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.search-block__checkbox-label:hover {
  background-color: #f8f9fa;
}
/* Filters Block Styles */
.filters-block {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* Exactly 4 columns for the 4 filters */
  gap: 1.5rem; /* Consistent gap between filters */
  margin-bottom: 2rem;
  width: 100%;
}
.filters-block__group {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.filters-block__group--wide {
  grid-column: 1 / -1;
}
.filters-block__label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  display: block;
}
.filters-block__select {
  width: 100%;
  padding: 1rem 2.5rem 1rem 1.25rem; /* Increased padding, with extra right padding for arrow */
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background-color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  height: 56px; /* Increased height to match search inputs */
  appearance: none; /* Remove default select styling */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%232c3e50' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1.25rem center;
  line-height: 1.5; /* Improved text alignment */
}
.filters-block__select:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  outline: none;
}
.filters-block__buttons {
  grid-column: 1 / -1; /* Span full width */
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}
.filters-block__button {
  padding: 1rem 1.5rem; /* Increased padding */
  height: 56px; /* Match height with filters */
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px; /* Ensure buttons have a good width */
}
.filters-block__button--search {
  background-color: #3498db;
  color: white;
}
.filters-block__button--search:hover {
  background-color: #2980b9;
}
.filters-block__button--favorites {
  background-color: #e74c3c;
  color: white;
}
.filters-block__button--favorites:hover {
  background-color: #c0392b;
}
/* Recipe Grid Styles */
.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}
.recipe-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}
.recipe-card__image-container {
  position: relative;
  padding-top: 75%;
}
.recipe-card__image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.recipe-card__content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  position: relative;
}
.recipe-card__info {
  flex-grow: 1;
  margin-bottom: 1rem;
}
.recipe-card__title {
  font-size: 1.25rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  font-weight: 600;
}
.recipe-card__time,
.recipe-card__diet {
  color: #666;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}
.recipe-card__button {
  width: 100%;
  padding: 0.75rem;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
  margin-top: auto;
}
.recipe-card__button:hover {
  background-color: #27ae60;
}
/* Pagination Styles */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  margin-top: auto;
}
.pagination__button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  background-color: #3498db;
  color: white;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}
.pagination__button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}
.pagination__button:not(:disabled):hover {
  background-color: #2980b9;
}
.pagination__text {
  font-weight: 600;
  color: #2c3e50;
}
@media (max-width: 1200px) {
  .filters-block {
    grid-template-columns: repeat(2, 1fr); /* 2 columns on medium screens */
  }
}
@media (max-width: 768px) {
  .recipe-explorer__container {
    padding: 1rem;
  }
  .filters-block {
    grid-template-columns: 1fr;
  }
  .recipe-grid {
    grid-template-columns: 1fr;
  }
  .filters-block__buttons {
    flex-direction: column;
  }
}
</style>


