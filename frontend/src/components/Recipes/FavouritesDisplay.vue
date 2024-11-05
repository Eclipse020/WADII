<template>
  <div class="favorites">
    <h1 class="favorites__title">🌟 Your Favorite Recipes</h1>
    <div v-if="favoriteRecipes.length === 0" class="favorites__empty">
      <p>📚 You have no favorite recipes yet!</p>
    </div>
    <div v-else class="favorites__grid">
      <div
        v-for="recipe in favoriteRecipes"
        :key="recipe.id"
        class="recipe-card"
      >
        <div class="recipe-card__image-container">
          <img 
            :src="recipe.image" 
            :alt="recipe.label"
            class="recipe-card__image"
          />
        </div>
        <h2 class="recipe-card__title">{{ recipe.label }}</h2>
        <p class="recipe-card__time">⏰ Total Time: {{ recipe.totalTime }} minutes</p>
        <div class="recipe-card__actions">
          <button 
            @click="toggleFavorite(recipe)"
            class="recipe-card__button recipe-card__button--favorite"
          >
            {{ isFavorite(recipe) ? "❌ Remove" : "❤️ Add to Favorites" }}
          </button>
          <button 
            class="recipe-card__button recipe-card__button--details"
            @click="viewDetails(recipe)"
          >
            👀 View Details
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";
import { db, auth } from '../../services/firebase'; // Adjust this path based on your project setup

export default {
  name: "FavouritesDisplay",
  data() {
    return {
      favoriteRecipes: [],
      currentUserId: null, // Set this based on your user authentication
    };
  },
  async created() {
    const user = auth.currentUser; // Get the current user from Firebase Auth
    if (user) {
      this.currentUserId = user.uid; // Set the currentUserId to the user's UID
      console.log("Current User ID:", this.currentUserId); // Log the actual user ID
      await this.fetchFavoriteRecipes();
    } else {
      console.error("User not authenticated. Redirecting to login.");
      this.$router.push('/login'); // Redirect to login if no user is found
    }
  },
  methods: {
    async fetchFavoriteRecipes() {
      console.log("Current User ID:", this.currentUserId); // Log current user ID
      if (!this.currentUserId) {
        console.error("No current user ID found");
        return;
      }
      try {
        const favoritesCollection = collection(db, `users/${this.currentUserId}/favorites`);
        const snapshot = await getDocs(favoritesCollection);
        
        this.favoriteRecipes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log("Fetched favorite recipes:", this.favoriteRecipes); // Check if data is retrieved
      } catch (error) {
        console.error("Error fetching favorite recipes:", error);
      }
    },
    async toggleFavorite(recipe) {
      const recipeIndex = this.favoriteRecipes.findIndex(fav => fav.label === recipe.label);
      if (recipeIndex !== -1) {
        const recipeId = this.favoriteRecipes[recipeIndex].id;
        console.log("toggled recipe.id: ", recipeId);
        await deleteDoc(doc(db, `users/${this.currentUserId}/favorites`, recipeId));
        this.favoriteRecipes.splice(recipeIndex, 1);
      } else {
        const favoriteRecipe = {
          label: recipe.label,
          image: recipe.image,
          url: recipe.url,
          ingredientLines: recipe.ingredientLines,
          totalTime: recipe.totalTime,
          uri: recipe.uri // Ensure consistent ID is saved
        };
        const favoritesCollection = collection(db, `users/${this.currentUserId}/favorites`);
        const docRef = await addDoc(favoritesCollection, favoriteRecipe);
        this.favoriteRecipes.push({ id: docRef.id, ...favoriteRecipe });
      }
    },
    isFavorite(recipe) {
      return this.favoriteRecipes.some(fav => fav.label === recipe.label);
    },
    viewDetails(recipe) {
      // Use the saved recipe ID and construct the proper URI format
      const recipeId = recipe.recipeId || recipe.id;
      this.$router.push({ 
        name: 'RecipeDetails', 
        params: { 
          id: recipeId 
        } 
      });
    }
  }
};
</script>


<style scoped>
.favorites {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.favorites__title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 700;
}

.favorites__empty {
  text-align: center;
  padding: 3rem;
  background-color: #f8f9fa;
  border-radius: 12px;
  font-size: 1.2rem;
  color: #6c757d;
}

.favorites__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.recipe-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.recipe-card__image-container {
  position: relative;
  padding-top: 75%; /* 4:3 Aspect Ratio */
  overflow: hidden;
}

.recipe-card__image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.recipe-card:hover .recipe-card__image {
  transform: scale(1.05);
}

.recipe-card__title {
  font-size: 1.25rem;
  color: #2c3e50;
  margin: 1rem;
  font-weight: 600;
  line-height: 1.4;
  height: 2.8em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.recipe-card__time {
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0.5rem 1rem;
}

.recipe-card__actions {
  padding: 1rem;
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.recipe-card__button {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.recipe-card__button:hover {
  transform: translateY(-2px);
}

.recipe-card__button--favorite {
  background-color: #ff4757;
  color: white;
}

.recipe-card__button--favorite:hover {
  background-color: #ff6b81;
}

.recipe-card__button--details {
  background-color: #2196f3;
  color: white;
}

.recipe-card__button--details:hover {
  background-color: #42a5f5;
}

/* Responsive Design */
@media (max-width: 768px) {
  .favorites {
    padding: 1rem;
  }

  .favorites__title {
    font-size: 2rem;
  }

  .favorites__grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .favorites__grid {
    grid-template-columns: 1fr;
  }
}
</style>