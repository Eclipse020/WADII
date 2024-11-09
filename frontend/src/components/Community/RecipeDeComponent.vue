<template>
  <div class="recipe-details">
    <!-- Close Button for the Recipe Card -->
    <router-link to="/community"><button class="recipe-details__close-btn" @click="closeCard">✖</button></router-link>

    <div class="recipe-details__content">
      <!-- Recipe Image -->
      <div class="recipe-details__image-wrapper">
        <img :src="recipe.image" alt="Recipe Image" class="recipe-details__image" v-if="recipe.image" />
      </div>
      <!-- Recipe Details -->
      <h1 class="recipe-details__name">{{ recipe.name }}</h1>
      <p class="recipe-details__description">{{ recipe.description }}</p>
      <!-- Additional Recipe Info -->
      <div class="recipe-details__additional-info">
        <p class="recipe-details__info-item">⏰ Estimated Time: {{ recipe.estimatedTime }} minutes</p>
        <p class="recipe-details__info-item">🍽️ Calories: {{ recipe.calories }}</p>
      </div>
      <!-- Recipe Content (Ingredients and Steps in Separate Sections) -->
      <div class="recipe-details__content">
        <!-- Ingredients Section -->
        <div class="recipe-details__ingredients">
          <h3 class="recipe-details__section-title">Ingredients</h3>
          <ul class="recipe-details__ingredients-list">
            <li v-for="ingredient in recipe.ingredients" :key="ingredient" class="recipe-details__ingredient-item">{{ ingredient }}</li>
          </ul>
        </div>
        <!-- Steps Section -->
        <div class="recipe-details__steps">
          <h3 class="recipe-details__section-title">Steps</h3>
          <ol class="recipe-details__recipe-steps">
            <li v-for="(step, index) in recipe.steps" :key="index" class="recipe-details__recipe-step">{{ step }}</li>
          </ol>
        </div>
      </div>
      <!-- "Add to Favorites" Button -->
      <button @click="toggleFavorite" class="recipe-details__btn recipe-details__btn--favorite shadow"
        :class="{'recipe-details__btn--success': !isFavorited, 'recipe-details__btn--secondary': isFavorited}">
        {{ isFavorited ? 'Remove from Favorites' : 'Add to Favorites' }}
      </button>
    </div>
  </div>
</template>

<script>
import { getRecipeById } from '@/services/RecipeService';
import { db, auth } from '../../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";

export default {
  name: 'RecipeDeComponent',
  props: {
    recipeId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      showFullImage: false,
      isFavorited: false,
      currentUserId: null,
      recipe: {
        ingredients: [],
        steps: []
      },
      favoriteRecipes: []
    };
  },
  methods: {
    async fetchRecipeDetails() {
      try {
        this.recipe = await getRecipeById(this.recipeId);

        if (this.recipe.steps) {
          this.recipe.steps = this.recipe.steps.split('\n');
        }

        // Check if this recipe is already in favorites
        await this.checkIfFavorited();
      } catch (error) {
        console.error("Failed to fetch recipe details:", error);
      }
    },
    async checkIfFavorited() {
      if (!this.currentUserId) return;

      try {
        const favoritesCollection = collection(db, `users/${this.currentUserId}/favorites`);
        const q = query(favoritesCollection, where("label", "==", this.recipe.name));
        const snapshot = await getDocs(q);
        this.isFavorited = !snapshot.empty;
      } catch (error) {
        console.error("Error checking favorite status:", error);
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
      if (!this.currentUserId) {
        console.error("User not authenticated");
        return;
      }

      try {
        const favoritesCollection = collection(db, `users/${this.currentUserId}/favorites`);

        if (this.isFavorited) {
          // Find the recipe document to delete
          const q = query(favoritesCollection, where("label", "==", this.recipe.name));
          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            const docId = snapshot.docs[0].id;
            await deleteDoc(doc(db, `users/${this.currentUserId}/favorites`, docId));
          }
        } else {
          // Create a new favorite with the expected structure
          const favoriteRecipe = {
            label: this.recipe.name,
            image: this.recipe.image,
            totalTime: this.recipe.estimatedTime,
            ingredientLines: this.recipe.ingredients,
            calories: this.recipe.calories,
            description: this.recipe.description,
            steps: this.recipe.steps,
            dateAdded: new Date().toISOString(),
            isFromCommunity: true,  // Add flag to identify community recipes
            communityRecipeId: this.recipeId  // Store the community recipe ID
          };

          await addDoc(favoritesCollection, favoriteRecipe);
        }

        // Toggle the favorite status
        this.isFavorited = !this.isFavorited;

        // Reload the favorites
        await this.loadFavoriteRecipes();
      } catch (error) {
        console.error("Error toggling favorite status:", error);
      }
    },
  },
  async created() {
    // Set currentUserId as soon as possible
    const user = auth.currentUser;
    if (user) {
      this.currentUserId = user.uid;
      await this.loadFavoriteRecipes();
      await this.fetchRecipeDetails();
    }

    // Listen for auth state changes
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.currentUserId = user.uid;
        await this.loadFavoriteRecipes();
        await this.fetchRecipeDetails();
      }
    });
  }
};
</script>

<style scoped>
.recipe-details {
  padding: 20px;
  margin-top: 30px; /* Adds top margin */
  max-width: 500px;
  margin: 20px auto; /* Centers the card */
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  position: relative;
}

.recipe-details__name {
  text-align: center;
}

.recipe-details__content {

  margin-top: 30px;
}

.recipe-details__close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
}

.recipe-details__image-wrapper {
  width: 100%;
  height: auto;
  overflow: hidden;
  cursor: pointer;
  border-radius: 8px;
}

.recipe-details__image {
  width: 100%;
  height: auto;
  object-fit: cover;
  max-height: 200px;
  border-radius: 8px;
  transition: box-shadow 0.3s ease;
}

.recipe-details__additional-info {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.recipe-details__info-item {
  font-size: 0.9rem;
  font-weight: 500;
}

.recipe-details__content {
  width: 100%;
  text-align: left; /* Aligns text to the left */
}

.recipe-details__ingredients,
.recipe-details__steps {
  margin: 20px 0;
}

.recipe-details__ingredients-list,
.recipe-details__recipe-steps {
  padding-left: 20px;
  margin: 10px 0;
}

.recipe-details__ingredient-item,
.recipe-details__recipe-step {
  font-size: 0.9rem;
  margin: 3px 0;
}

.recipe-details__btn {
  padding: 8px 12px;
  font-size: 0.9rem;
  border: none; /* Removes border around button */
  border-radius: 5px;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.recipe-details__btn--favorite {
  background-color: #28a745;
  color: white;
  font-weight: bold;
}

.recipe-details__btn--secondary {
  background-color: #dc3545;
}
</style>
