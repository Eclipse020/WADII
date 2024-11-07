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
import { getRecipeById } from '@/services/RecipeService'; // Adjust path if necessary
import { db, auth } from '../../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, deleteDoc, doc, getDocs } from "firebase/firestore";

export default {
  props: {
    recipeId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      showFullImage: false, // Controls the full-image modal display
      isFavorited: false, // Tracks if recipe is favorited
      recipe: {
        ingredients: [],
        steps: [] // Ensure steps are initialized as an array
      },
    };
  },
  methods: {
    async fetchRecipeDetails() {
      try {
        this.recipe = await getRecipeById(this.recipeId); // Use the passed recipeId prop

        // Split the steps string into an array by line breaks
        if (this.recipe.steps) {
          this.recipe.steps = this.recipe.steps.split('\n'); // Adjust delimiter if needed
        }
      } catch (error) {
        console.error("Failed to fetch recipe details:", error);
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

      this.isFavorited = !this.isFavorited;

      const recipeIndex = this.favoriteRecipes.findIndex(fav => fav.label === this.recipe.label);

      try {
        if (recipeIndex !== -1) {
          const recipeId = this.favoriteRecipes[recipeIndex].id;
          await deleteDoc(doc(db, `users/${this.currentUserId}/favorites`, recipeId));
          this.favoriteRecipes.splice(recipeIndex, 1);
        } else {
          const favoriteRecipe = {
            label: this.recipe.label,
            image: this.recipe.image,
            url: this.recipe.url,
            ingredientLines: this.recipe.ingredientLines,
            totalTime: this.recipe.totalTime,
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
  },
  mounted() {
    this.fetchRecipeDetails(); // Fetch details when component is mounted
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.currentUserId = user.uid;
        await this.loadFavoriteRecipes();
      }
    });
  },
};
</script>

<style scoped>
.recipe-details {
  padding: 20px; /* Add padding */
  display: flex; /* Use flexbox for centering */
  flex-direction: column; /* Stack elements vertically */
  align-items: center; /* Center horizontally */
  text-align: center; /* Center text */
}

/* Recipe Image */
.recipe-details__image-wrapper {
  width: 100%; /* Set width to full width */
  height: auto; /* Adjust height automatically */
  overflow: hidden; /* Hide overflow to maintain crop */
  cursor: pointer;
  position: relative; /* Make it position relative for image styling */
}

.recipe-details__image {
  width: 100%; /* Use full width of the wrapper */
  height: auto; /* Maintain aspect ratio */
  object-fit: cover; /* Ensures the image covers the area without stretching */
  max-height: 300px; /* Set a maximum height to avoid it being too tall */
}

/* Additional Info Styling */
.recipe-details__additional-info {
  display: flex; /* Use flexbox for layout */
  justify-content: center; /* Center items horizontally */
  gap: 20px; /* Add spacing between items */
  margin: 20px 0; /* Add margin for spacing */
}

.recipe-details__info-item {
  font-size: 1rem;
  font-weight: 500;
}

/* Ingredients List */
.recipe-details__ingredients-list {
  list-style-type: disc; /* Keep bullet points */
  padding-left: 20px; /* Add padding for bullets */
  margin: 20px 0; /* Add margin for spacing */
}

.recipe-details__ingredient-item {
  font-size: 20px; /* Increase font size for ingredients */
  margin: 5px 0; /* Add margin for each ingredient */
  text-align: left; /* Align text to the left for better readability */
}

/* Recipe Steps */
.recipe-details__recipe-steps {
  list-style-position: outside; /* Keep the numbers/bullets outside */
  padding-left: 20px; /* Add padding for left alignment */
  margin: 0; /* Remove margin */
  font-size: 1.2em; /* Adjust font size as desired */
}

.recipe-details__recipe-step {
  margin: 5px 0; /* Optional: add some vertical spacing between steps */
  line-height: 1.4; /* Adjust line height for better readability */
  text-align: left; /* Align text to the left */
}

/* Full-screen modal styles */
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

/* Button styles */
.recipe-details__btn {
  padding: 10px 15px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
}

.recipe-details__btn--favorite {
  background-color: #28a745; /* Green for 'Add to Favorites' */
}

.recipe-details__btn--secondary {
  background-color: #6c757d; /* Grey for 'Added to Favorites' */
}

.recipe-details__btn--success {
  background-color: #28a745; /* Green for 'Add to Favorites' */
}

</style>
