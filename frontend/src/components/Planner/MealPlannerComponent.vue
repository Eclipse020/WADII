<template>
  <div class="meal-plan">
    <div class="container">
      <!-- Favorite Recipes Section -->
      <div class="favorites-section mb-4">
        <h2>Favorite Recipes</h2>
        <div class="favorite-recipes">
          <div v-for="recipe in favoriteRecipes" :key="recipe.id" class="favorite-recipe-card">
            <h4>{{ recipe.name }}</h4>
            <p>{{ recipe.description }}</p>
            <button class="btn btn-primary btn-sm" @click="addToMealPlan(recipe)">Add to Plan</button>
            <button class="btn btn-danger btn-sm" @click="removeFromFavorites(recipe)">
              <i class="fas fa-heart-broken"></i>
            </button>
          </div>
        </div>
      </div>

      <h2>Weekly Meal Planner</h2>
      <div class="search-section mb-3">
        <input
          v-model="newRecipeName"
          placeholder="Search or add a recipe"
          @keyup.enter="addRecipeToDay"
          class="form-control"
        />
        <select v-model="selectedDay" class="form-select">
          <option v-for="(day, index) in mealPlan.days" :key="index" :value="index">
            {{ day.name }}
          </option>
        </select>
        <button class="btn btn-primary" @click="addRecipeToDay">Add Recipe</button>
        <button class="btn btn-success ms-2" @click="generateSuggestedPlan">
          Generate Suggested Plan
        </button>
      </div>

      <table class="meal-plan-table">
        <thead>
          <tr>
            <th v-for="(day, index) in mealPlan.days" :key="index">{{ day.name }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              v-for="(day, index) in mealPlan.days"
              :key="index"
              @dragover.prevent
              @drop="dropRecipe($event, index)"
              class="meal-day"
            >
              <ul class="recipe-list">
                <li
                  v-for="(recipe, recipeIndex) in day.recipes"
                  :key="recipeIndex"
                  draggable
                  @dragstart="dragRecipe($event, recipe)"
                  class="recipe-slot"
                >
                  <div class="recipe-content">
                    <span>{{ recipe.name }}</span>
                    <div class="recipe-actions">
                      <button class="btn btn-sm btn-outline-primary" @click="toggleFavorite(recipe)">
                        <i :class="recipe.isFavorite ? 'fas fa-heart' : 'far fa-heart'"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" @click="removeRecipe(day, recipe)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  <div class="recipe-ingredients" v-if="recipe.ingredients">
                    <small>Missing ingredients: {{ getMissingIngredients(recipe).join(', ') }}</small>
                  </div>
                </li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Shopping List Section -->
      <div class="shopping-list-section mt-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2>Shopping List</h2>
          <div>
            <button class="btn btn-success me-2" @click="exportToPDF">
              <i class="fas fa-file-pdf"></i> Export PDF
            </button>
            <button class="btn btn-primary me-2" @click="shareList">
              <i class="fas fa-share-alt"></i> Share
            </button>
            <button class="btn btn-warning" @click="syncWithFridge">
              <i class="fas fa-sync"></i> Sync with Fridge
            </button>
          </div>
        </div>
        <div class="shopping-list">
          <div class="input-group mb-3">
            <input
              v-model="newShoppingItem"
              class="form-control"
              placeholder="Add item to shopping list"
              @keyup.enter="addItemToShoppingList"
            />
            <button class="btn btn-primary" @click="addItemToShoppingList">Add</button>
          </div>
          <ul class="list-group">
            <li
              v-for="(item, index) in shoppingList"
              :key="index"
              class="list-group-item d-flex justify-content-between align-items-center"
            >
              <div class="form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  :id="'item-' + index"
                  v-model="item.purchased"
                  @change="updateInventory(item)"
                />
                <label class="form-check-label" :for="'item-' + index">{{ item.name }}</label>
              </div>
              <button class="btn btn-sm btn-danger" @click="removeItemFromShoppingList(index)">
                <i class="fas fa-times"></i>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { db } from '../../services/firebase';
import { collection, getDocs, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import html2pdf from 'html2pdf.js';

export default {
  name: 'MealPlannerComponent',
  setup() {
    const currentUserId = ref(null);
    const mealPlan = ref({
      days: Array.from({ length: 7 }, (_, index) => ({
        name: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index],
        recipes: []
      }))
    });

    return {
      currentUserId,
      mealPlan,
    };
  },
  data() {
    return {
      shoppingList: [],
      newShoppingItem: '',
      newRecipeName: '',
      selectedDay: 0,
      draggedRecipe: null,
      favoriteRecipes: [],
      fridgeInventory: [],
    };
  },
  methods: {
    async initializeFirestoreDocuments() {
      if (!this.currentUserId) return;

      try {
        const mealPlanRef = doc(db, `users/${this.currentUserId}/mealPlanner/current`);
        const shoppingListRef = doc(db, `users/${this.currentUserId}/mealPlanner/shoppingList`);
        const favoritesRef = doc(db, `users/${this.currentUserId}/mealPlanner/favorites`);

        await Promise.all([
          this.createDocumentIfNotExists(mealPlanRef, { days: this.mealPlan.days }),
          this.createDocumentIfNotExists(shoppingListRef, { items: [] }),
          this.createDocumentIfNotExists(favoritesRef, { recipes: [] }),
        ]);
      } catch (error) {
        console.error("Error initializing Firestore documents:", error);
      }
    },

    async createDocumentIfNotExists(docRef, data) {
      const docSnapshot = await getDoc(docRef);
      if (!docSnapshot.exists()) {
        await setDoc(docRef, data);
      }
    },

    async fetchFridgeInventory() {
      if (this.currentUserId) {
        try {
          const querySnapshot = await getDocs(collection(db, `users/${this.currentUserId}/items`));
          this.fridgeInventory = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
          console.error("Error fetching fridge inventory:", error);
        }
      }
    },

    getMissingIngredients(recipe) {
      if (!recipe.ingredients) return [];
      return recipe.ingredients.filter(ingredient => 
        !this.fridgeInventory.some(item => 
          item.name.toLowerCase() === ingredient.toLowerCase()
        )
      );
    },

    async syncWithFridge() {
      await this.fetchFridgeInventory();
      // Update shopping list based on missing ingredients
      this.mealPlan.days.forEach(day => {
        day.recipes.forEach(recipe => {
          const missingIngredients = this.getMissingIngredients(recipe);
          missingIngredients.forEach(ingredient => {
            if (!this.shoppingList.some(item => item.name === ingredient)) {
              this.shoppingList.push({
                name: ingredient,
                purchased: false,
                recipeId: recipe.id
              });
            }
          });
        });
      });
      await this.saveShoppingList();
    },

    async toggleFavorite(recipe) {
      recipe.isFavorite = !recipe.isFavorite;
      if (recipe.isFavorite) {
        if (!this.favoriteRecipes.some(r => r.name === recipe.name)) {
          this.favoriteRecipes.push(recipe);
          await this.saveFavoriteRecipes();
        }
      } else {
        await this.removeFromFavorites(recipe);
      }
    },

    async saveFavoriteRecipes() {
      if (this.currentUserId) {
        try {
          const favoritesRef = doc(db, `users/${this.currentUserId}/mealPlanner/favorites`);
          await updateDoc(favoritesRef, {
            recipes: this.favoriteRecipes
          });
        } catch (error) {
          console.error("Error saving favorite recipes:", error);
        }
      }
    },

    async removeFromFavorites(recipe) {
      const index = this.favoriteRecipes.findIndex(r => r.name === recipe.name);
      if (index !== -1) {
        this.favoriteRecipes.splice(index, 1);
        await this.saveFavoriteRecipes();
      }
    },

    async addToMealPlan(recipe) {
      const day = this.mealPlan.days[this.selectedDay];
      if (!day.recipes.some(r => r.name === recipe.name)) {
        day.recipes.push(recipe);
        await this.saveMealPlan();
      }
    },

    async saveMealPlan() {
      if (this.currentUserId) {
        try {
          const mealPlanRef = doc(db, `users/${this.currentUserId}/mealPlanner/current`);
          await updateDoc(mealPlanRef, { days: this.mealPlan.days });
        } catch (error) {
          console.error("Error saving meal plan:", error);
        }
      }
    },

    async generateSuggestedPlan() {
      // Logic for generating suggested meal plans
    },

    async exportToPDF() {
      const element = document.createElement('div');
      element.innerHTML = `
        <h2>Shopping List</h2>
        <ul>
          ${this.shoppingList.map(item => `<li>${item.name}</li>`).join('')}
        </ul>
      `;
      
      const opt = {
        margin: 1,
        filename: 'shopping-list.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf().from(element).set(opt).save();
    },

    async addItemToShoppingList() {
      if (this.newShoppingItem.trim() !== '') {
        this.shoppingList.push({ name: this.newShoppingItem, purchased: false });
        this.newShoppingItem = '';
        await this.saveShoppingList();
      }
    },

    async removeItemFromShoppingList(index) {
      this.shoppingList.splice(index, 1);
      await this.saveShoppingList();
    },

    async saveShoppingList() {
      if (this.currentUserId) {
        try {
          const shoppingListRef = doc(db, `users/${this.currentUserId}/mealPlanner/shoppingList`);
          await updateDoc(shoppingListRef, { items: this.shoppingList });
        } catch (error) {
          console.error("Error saving shopping list:", error);
        }
      }
    },

    // updateInventory(item) {
    //   // Update inventory logic
    // },

    addRecipeToDay() {
      const recipe = this.favoriteRecipes.find(r => r.name.toLowerCase() === this.newRecipeName.toLowerCase());
      if (recipe) {
        this.addToMealPlan(recipe);
        this.newRecipeName = '';
      }
    },

    dragRecipe(event, recipe) {
      this.draggedRecipe = recipe;
    },

    dropRecipe(event, dayIndex) {
      event.preventDefault();
      if (this.draggedRecipe) {
        this.addToMealPlan(this.draggedRecipe, dayIndex);
        this.draggedRecipe = null;
      }
    },

    async removeRecipe(day, recipe) {
      const index = day.recipes.indexOf(recipe);
      if (index !== -1) {
        day.recipes.splice(index, 1);
        await this.saveMealPlan();
      }
    },

    shareList() {
      // Logic to share shopping list
    }
  },
  mounted() {
    this.initializeFirestoreDocuments();
    this.fetchFridgeInventory();
  },
};
</script>

<style scoped>
.meal-plan {
  padding: 20px;
}
.favorite-recipes {
  display: flex;
  flex-wrap: wrap;
}
.favorite-recipe-card {
  border: 1px solid #ccc;
  padding: 10px;
  margin: 10px;
  border-radius: 5px;
}
.meal-plan-table {
  width: 100%;
  margin: 20px 0;
}
.recipe-list {
  list-style: none;
  padding: 0;
}
.recipe-slot {
  padding: 5px;
}
.recipe-actions {
  display: flex;
  gap: 5px;
}
</style>
