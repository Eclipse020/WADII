<template>
  <div class="recipe-details">
    <!-- Recipe Image with Full-Image Modal -->
    <div class="recipe-details__image-wrapper" @click="showFullImage = true">
      <img :src="recipe.image" alt="Recipe Image" class="recipe-details__image" v-if="recipe.image" />
    </div>
    <div v-if="showFullImage" class="recipe-details__modal-overlay" @click="showFullImage = false">
      <img :src="recipe.image" alt="Full Recipe Image" class="recipe-details__full-image" />
    </div>

    <!-- Recipe Details -->
    <h1 class="recipe-details__name">{{ recipe.name }}</h1>
    <p class="recipe-details__description">{{ recipe.description }}</p>

    <!-- Additional Recipe Info -->
    <div class="recipe-details__additional-info">
      <p class="recipe-details__info-item">⏰ Estimated Time: {{ recipe.estimatedTime }} minutes</p>
      <p class="recipe-details__info-item">🍽️ Calories: {{ recipe.calories }}</p>
    </div>

    <!-- Ingredients List -->
    <h3 class="recipe-details__section-title">Ingredients</h3>
    <ul class="recipe-details__ingredients-list">
      <li v-for="ingredient in recipe.ingredients" :key="ingredient" class="recipe-details__ingredient-item">{{ ingredient }}</li>
    </ul>

    <!-- Recipe Steps -->
    <h3 class="recipe-details__section-title">Steps</h3>
    <ol class="recipe-details__recipe-steps">
      <li v-for="(step, index) in recipe.steps" :key="index" class="recipe-details__recipe-step">{{ step }}</li>
    </ol>

    <!-- "Add to Favorites" Button -->
    <button @click="toggleFavorite" class="recipe-details__btn recipe-details__btn--favorite mx-2 shadow"
    :class="{'recipe-details__btn--success': !isFavorited, 'recipe-details__btn--secondary': isFavorited}">
      {{ isFavorited ? 'Remove from Favorites' : 'Add to Favorites' }}
    </button>
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
    }
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
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.recipe-details__image-wrapper {
  width: 100%;
  height: auto;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.recipe-details__image {
  width: 100%;
  height: auto;
  object-fit: cover;
  max-height: 300px;
}

.recipe-details__additional-info {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
}

.recipe-details__info-item {
  font-size: 1rem;
  font-weight: 500;
}

.recipe-details__ingredients-list {
  list-style-type: disc;
  padding-left: 20px;
  margin: 20px 0;
}

.recipe-details__ingredient-item {
  font-size: 20px;
  margin: 5px 0;
  text-align: left;
}

.recipe-details__recipe-steps {
  list-style-position: outside;
  padding-left: 20px;
  margin: 0;
  font-size: 1.2em;
}

.recipe-details__recipe-step {
  margin: 5px 0;
  line-height: 1.4;
  text-align: left;
}

.recipe-details__modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  cursor: pointer;
}

.recipe-details__full-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.recipe-details__btn {
  padding: 10px 15px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: white;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.recipe-details__btn--favorite {
  background-color: #28a745;
}

.recipe-details__btn--secondary {
  background-color: #dc3545;
}

.recipe-details__btn--success {
  background-color: #28a745;
}

.recipe-details__btn:hover {
  opacity: 0.9;
}
</style>
