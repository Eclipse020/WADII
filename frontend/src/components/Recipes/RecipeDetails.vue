<!-- Previous template section remains unchanged -->
<template>
  <div v-if="recipe && recipe.label" class="recipe">
    <!-- Header Section -->
    <header class="recipe__header">
      <h1 class="recipe__title">{{ recipe.label }}</h1>
      <p class="recipe__time">Ready in <strong>{{ recipe.totalTime }}</strong> minutes</p>
    </header>

    <!-- Nutritional Information Section -->
    <section v-if="nutrition" class="recipe__nutrition">
      <h2 class="recipe__nutrition-title">Nutritional Information</h2>
      <ul class="recipe__nutrition-list">
        <li class="recipe__nutrition-item">
          <span>Calories</span>
          <strong>{{ nutrition.calories }} kcal</strong>
        </li>
        <li class="recipe__nutrition-item">
          <span>Protein</span>
          <strong>{{ nutrition.protein }} g</strong>
        </li>
        <li class="recipe__nutrition-item">
          <span>Carbohydrates</span>
          <strong>{{ nutrition.carbs }} g</strong>
        </li>
        <li class="recipe__nutrition-item">
          <span>Fats</span>
          <strong>{{ nutrition.fats }} g</strong>
        </li>
      </ul>
    </section>

    <!-- Ingredients Section -->
    <section class="recipe__ingredients">
      <h2 class="recipe__ingredients-title">Ingredients</h2>
      <ul class="recipe__ingredients-list">
        <li 
          v-for="(ingredient, index) in recipe.ingredientLines" 
          :key="index" 
          class="recipe__ingredient"
          :class="{ 'recipe__ingredient--available': fridgeItems.includes(ingredient) }"
        >
          {{ ingredient }}
        </li>
      </ul>
    </section>

    <!-- Instructions Section -->
    <section class="recipe__instructions">
      <h2 class="recipe__instructions-title">Instructions</h2>
      <div class="recipe__instructions-content" v-html="formattedInstructions"></div>
    </section>

    <!-- Action Buttons -->
    <div class="recipe__actions">
      <button 
        class="recipe__button recipe__button--primary" 
        @click="cookNow"
      >
        Mark as completed
      </button>
      <button 
        class="recipe__button recipe__button--secondary"
        :class="{ 'recipe__button--active': isRecipeInFavorites }"
        @click="toggleFavorite"
      >
        {{ isRecipeInFavorites ? 'Remove from Favorites' : 'Add to Favorites' }}
      </button>
    </div>
  </div>

  <!-- Loading State -->
  <div v-else class="recipe__loading">
    Loading recipe details...
  </div>
</template>

<script>
const { GoogleGenerativeAI } = require("@google/generative-ai");
import { db, auth } from '../../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import axios from 'axios';

export default {
  data() {
    return {
      recipe: {},
      fridgeItems: [],
      instructions: "",
      nutrition: null,
      currentUserId: null,
      favoriteRecipes: []
    };
  },
  computed: {
    formattedInstructions() {
      let formatted = this.instructions;
      
      // Update class names to match BEM
      formatted = formatted.replace(
        /^##\s(.+)$/gm, 
        '<h3 class="recipe__section-title">$1</h3>'
      );
      
      formatted = formatted.replace(
        /^\*\*([^*]+)\*\*:$/gm, 
        '<h4 class="recipe__subsection-title">$1:</h4>'
      );
      
      formatted = formatted.replace(
        /^\d+\.\s\*\*([^*]+)\*\*:\s(.+)$/gm, 
        '<div class="recipe__step"><span class="recipe__step-title">$1:</span> $2</div>'
      );
      
      formatted = formatted.replace(
        /^\*\s(.+)$/gm, 
        '<li class="recipe__list-item">$1</li>'
      );
      
      formatted = formatted.replace(
        /(?:(<li class="recipe__list-item">.+<\/li>\n?)+)/g,
        '<ul class="recipe__list">$1</ul>'
      );
      
      formatted = formatted.replace(
        /\*\*([^*]+)\*\*/g, 
        '<strong class="recipe__text-bold">$1</strong><br>'
      );
      
      formatted = formatted.split('\n\n').map(paragraph => {
        if (!paragraph.startsWith('<')) {
          return `<p class="recipe__paragraph">${paragraph}</p>`;
        }
        return paragraph;
      }).join('\n');
      
      return formatted;
    },
    isRecipeInFavorites() {
      return this.favoriteRecipes.some(fav => fav.label === this.recipe.label);
    }
  },
  mounted() {
    const recipeId = this.$route.params.id;
    console.log("mounted recipe.id: ", recipeId)
    if (recipeId) {
      this.fetchRecipeById(recipeId);
    } else {
      console.error("Recipe not found or invalid recipe data.");
    }

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.currentUserId = user.uid;
        await this.loadFavoriteRecipes();
      }
    });
  },
  methods: {
    async fetchInstructions() {
      try {
        const genAI = new GoogleGenerativeAI(process.env.VUE_APP_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Write only the step-by-step instructions (no title) for making ${this.recipe.label} using the following ingredients: ${this.recipe.ingredientLines.join(", ")}.`;
        const result = await model.generateContent(prompt);
        
        if (result?.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
          this.instructions = result.response.candidates[0].content.parts[0].text;
        } else {
          this.instructions = "No instructions available.";
        }
      } catch (error) {
        console.error("Error generating instructions:", error);
        this.instructions = "Error generating instructions.";
      }
    },
    async fetchRecipeById(recipeId) {
      try {
        const response = await axios.get(`https://api.edamam.com/search?r=${recipeId}&app_id=fcbb645c&app_key=475ad8f07b669d07d1b4e5a021a100cc`);
        if (response.data?.[0]) {
          this.recipe = response.data[0];
          await this.fetchInstructions();

          this.nutrition = {
            calories: Math.round(this.recipe.calories),
            protein: this.recipe.totalNutrients.PROCNT?.quantity.toFixed(1) ?? "N/A",
            carbs: this.recipe.totalNutrients.CHOCDF?.quantity.toFixed(1) ?? "N/A",
            fats: this.recipe.totalNutrients.FAT?.quantity.toFixed(1) ?? "N/A"
          };
        }
      } catch (error) {
        console.error("Error fetching recipe by ID:", error);
      }
    },
    async deleteFromMealPlan() {
      if (!this.currentUserId || !this.recipe.uri) return;

      try {
        // Query the mealPlans collection to find entries with matching recipe URI
        const mealPlansRef = collection(db, `users/${this.currentUserId}/mealPlans`);
        const q = query(mealPlansRef, where("recipe.uri", "==", this.recipe.uri));
        const querySnapshot = await getDocs(q);

        // Delete all matching entries
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        console.log("Recipe removed from meal plan");
      } catch (error) {
        console.error("Error removing recipe from meal plan:", error);
      }
    },
    async cookNow() {
      if (!this.currentUserId) return;

      const completedRecipe = {
        label: this.recipe.label,
        image: this.recipe.image,
        url: this.recipe.url,
        ingredientLines: this.recipe.ingredientLines,
        totalTime: this.recipe.totalTime,
        completionDate: new Date().toLocaleDateString()
      };

      try {
        // Add to completed recipes
        const completedRecipesCollection = collection(db, `users/${this.currentUserId}/completedRecipes`);
        await addDoc(completedRecipesCollection, completedRecipe);

        // Delete from meal plan
        await this.deleteFromMealPlan();

        // Navigate to CookNow page
        this.$router.push({ 
          name: 'CookNow', 
          params: { id: this.$route.params.id },
          query: { 
            requiredIngredients: JSON.stringify(this.recipe.ingredientLines),
            fridgeIngredients: JSON.stringify(this.fridgeItems)
          }
        });
      } catch (error) {
        console.error("Error marking recipe as completed:", error);
      }
    },
    async loadFavoriteRecipes() {
      if (!this.currentUserId) return;
      
      try {
        const favoritesCollection = collection(db, `users/${this.currentUserId}/favorites`);
        const snapshot = await getDocs(favoritesCollection);
        this.favoriteRecipes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error("Error loading favorite recipes:", error);
      }
    },
    async toggleFavorite() {
      if (!this.currentUserId) return;

      try {
        const recipeIndex = this.favoriteRecipes.findIndex(fav => fav.label === this.recipe.label);

        if (recipeIndex !== -1) {
          // If the recipe is already in favorites, delete it
          const existingRecipeId = this.favoriteRecipes[recipeIndex].id;
          await deleteDoc(doc(db, `users/${this.currentUserId}/favorites`, existingRecipeId));
          this.favoriteRecipes.splice(recipeIndex, 1);
        } else {
          // Add the recipe to favorites with all necessary properties
          const favoriteRecipe = {
            label: this.recipe.label,
            image: this.recipe.image,
            url: this.recipe.url,
            uri: this.recipe.uri,
            ingredientLines: this.recipe.ingredientLines,
            totalTime: this.recipe.totalTime,
            calories: this.recipe.calories || 0,
            yield: this.recipe.yield || 1,
            totalNutrients: {
              PROCNT: this.recipe.totalNutrients?.PROCNT || { quantity: 0, unit: 'g' },
              FAT: this.recipe.totalNutrients?.FAT || { quantity: 0, unit: 'g' },
              CHOCDF: this.recipe.totalNutrients?.CHOCDF || { quantity: 0, unit: 'g' }
            },
            dateAdded: new Date().toLocaleDateString()
          };

          const favoritesCollection = collection(db, `users/${this.currentUserId}/favorites`);
          const docRef = await addDoc(favoritesCollection, favoriteRecipe);
          this.favoriteRecipes.push({ id: docRef.id, ...favoriteRecipe });
        }
      } catch (error) {
        console.error("Error toggling favorite status:", error);
      }
    }
  }
};
</script>

<style scoped>
/* Recipe Page Base Styles */
.recipe {
  --color-primary: #4a8c3a;
  --color-primary-light: #66bb6a;
  --color-primary-dark: #2e7d32;
  --color-background: #e8f5e9;
  --color-background-light: #f1f8e9;
  --color-text: #343a40;
  --color-text-light: #6c757d;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 10px rgba(0, 0, 0, 0.1);
  --border-radius-sm: 8px;
  --border-radius-md: 12px;
  --border-radius-lg: 15px;
}

.recipe {
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  padding: 2rem;
  background-color: var(--color-background);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  max-width: 1200px;
  margin: 2rem auto;
}

/* Header Section */
.recipe__header {
  text-align: center;
  margin-bottom: 2rem;
}

.recipe__title {
  font-size: 2.5rem;
  color: var(--color-primary);
  margin-bottom: 1rem;
  position: relative;
  padding-bottom: 1rem;
}

.recipe__title::after {
  content: '👨‍🍳';
  display: inline-block;
  margin-left: 0.5rem;
}

.recipe__time {
  font-size: 1.2rem;
  color: var(--color-text-light);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.recipe__time::before {
  content: '⏲️';
}

/* Nutrition Section */
.recipe__nutrition {
  background-color: white;
  border-radius: var(--border-radius-md);
  padding: 1.5rem;
  margin: 2rem 0;
  box-shadow: var(--shadow-sm);
}

.recipe__nutrition-title {
  color: var(--color-primary-dark);
  font-size: 1.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.recipe__nutrition-title::before {
  content: '📊';
}

.recipe__nutrition-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  list-style: none;
  padding: 0;
}

.recipe__nutrition-item {
  background-color: var(--color-background-light);
  padding: 1rem;
  border-radius: var(--border-radius-sm);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Ingredients Section */
.recipe__ingredients {
  margin: 2rem 0;
}

.recipe__ingredients-title {
  color: var(--color-primary-dark);
  font-size: 1.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.recipe__ingredients-title::before {
  content: '🥗';
}

.recipe__ingredients-list {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.recipe__ingredient {
  background-color: white;
  padding: 1rem;
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s;
}

.recipe__ingredient:hover {
  transform: translateY(-2px);
}

.recipe__ingredient--available {
  border-left: 4px solid var(--color-primary);
}

/* Instructions Section */
.recipe__instructions {
  background-color: var(--color-background-light);
  padding: 2rem;
  border-radius: var(--border-radius-md);
  margin: 2rem 0;
  box-shadow: var(--shadow-sm);
}

.recipe__instructions-title {
  color: var(--color-primary-dark);
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.recipe__instructions-title::before {
  content: '📝';
}

.recipe__step {
  background-color: white;
  padding: 1.5rem;
  border-radius: var(--border-radius-sm);
  margin-bottom: 1rem;
  box-shadow: var(--shadow-sm);
  position: relative;
}

.recipe__step-title {
  color: var(--color-primary);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

/* Action Buttons */
.recipe__actions {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

.recipe__button {
  padding: 1rem 2rem;
  border-radius: 2rem;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.recipe__button--primary {
  background-color: var(--color-primary);
  color: white;
}

.recipe__button--primary:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-2px);
}

.recipe__button--primary::before {
  content: '👩‍🍳';
}

.recipe__button--secondary {
  background-color: var(--color-primary-light);
  color: white;
}

.recipe__button--secondary:hover {
  background-color: var(--color-primary);
  transform: translateY(-2px);
}

.recipe__button--secondary::before {
  content: '⭐';
}

.recipe__button--secondary.recipe__button--active {
  background-color: var(--color-primary-dark);
}

.recipe__button--secondary.recipe__button--active::before {
  content: '★';
}

/* Loading State */
.recipe__loading {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-light);
  font-size: 1.2rem;
}

.recipe__loading::after {
  content: '⏳';
  display: inline-block;
  margin-left: 0.5rem;
  animation: spin 2s infinite linear;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .recipe {
    padding: 1rem;
    margin: 1rem;
  }

  .recipe__title {
    font-size: 2rem;
  }

  .recipe__nutrition-list {
    grid-template-columns: 1fr;
  }

  .recipe__ingredients-list {
    grid-template-columns: 1fr;
  }

  .recipe__actions {
    flex-direction: column;
  }

  .recipe__button {
    width: 100%;
  }
}
</style>
