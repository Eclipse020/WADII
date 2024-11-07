<template>
  <!-- Template remains unchanged -->
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
            :alt="recipe.label || recipe.name"
            class="recipe-card__image"
          />
        </div>
        <h2 class="recipe-card__title">{{ recipe.label || recipe.name }}</h2>
        <p class="recipe-card__time">⏰ Total Time: {{ recipe.totalTime || recipe.estimatedTime }} minutes</p>
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
import { db, auth } from '../../services/firebase';

export default {
  name: "FavouritesDisplay",
  data() {
    return {
      favoriteRecipes: [],
      currentUserId: null,
    };
  },
  async created() {
    const user = auth.currentUser;
    if (user) {
      this.currentUserId = user.uid;
      console.log("Current User ID:", this.currentUserId);
      await this.fetchFavoriteRecipes();
    } else {
      console.error("User not authenticated. Redirecting to login.");
      this.$router.push('/login');
    }
  },
  methods: {
    async fetchFavoriteRecipes() {
      console.log("Current User ID:", this.currentUserId);
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

        console.log("Fetched favorite recipes:", this.favoriteRecipes);
      } catch (error) {
        console.error("Error fetching favorite recipes:", error);
      }
    },
    async toggleFavorite(recipe) {
      try {
        console.log("Attempting to toggle recipe:", recipe);
        
        if (this.isFavorite(recipe)) {
          // Find the recipe in our local array
          const recipeToDelete = this.favoriteRecipes.find(fav => 
            fav.label === (recipe.label || recipe.name)
          );
          
          if (recipeToDelete && recipeToDelete.id) {
            console.log("Found recipe to delete with ID:", recipeToDelete.id);
            
            const docRef = doc(db, `users/${this.currentUserId}/favorites`, recipeToDelete.id);
            await deleteDoc(docRef);
            console.log("Document successfully deleted");
            
            // Remove from local array
            const recipeIndex = this.favoriteRecipes.findIndex(fav => fav.id === recipeToDelete.id);
            if (recipeIndex !== -1) {
              this.favoriteRecipes.splice(recipeIndex, 1);
              console.log("Recipe removed from local array");
            }
          } else {
            console.error("Could not find recipe document ID for deletion");
          }
        } else {
          // Save the complete recipe data structure
          const favoriteRecipe = {
            ...recipe,  // Keep all original recipe properties
            label: recipe.label || recipe.name,
            image: recipe.image,
            url: recipe.url,
            ingredientLines: recipe.ingredientLines || recipe.ingredients,
            totalTime: recipe.totalTime || recipe.estimatedTime,
            calories: recipe.calories || 0,
            yield: recipe.yield || 1,
            totalNutrients: recipe.totalNutrients || {
              PROCNT: { quantity: 0, unit: 'g' },
              FAT: { quantity: 0, unit: 'g' },
              CHOCDF: { quantity: 0, unit: 'g' }
            }
          };

          // Ensure the URI is included for non-community recipes
          if (!recipe.isFromCommunity && recipe.uri) {
            favoriteRecipe.uri = recipe.uri;
          }

          console.log("Saving favorite recipe:", favoriteRecipe);
          
          const favoritesCollection = collection(db, `users/${this.currentUserId}/favorites`);
          const docRef = await addDoc(favoritesCollection, favoriteRecipe);
          this.favoriteRecipes.push({ id: docRef.id, ...favoriteRecipe });
        }
      } catch (error) {
        console.error("Error in toggleFavorite:", error);
        throw error;
      }
    },
    isFavorite(recipe) {
      return this.favoriteRecipes.some(fav => 
        fav.label === (recipe.label || recipe.name)
      );
    },
    viewDetails(recipe) {
      console.log("Viewing details for recipe:", recipe);
      
      // Handle community recipes
      if (recipe.isFromCommunity || recipe.communityRecipeId) {
        const recipeId = recipe.communityRecipeId || recipe.id;
        console.log("Routing to community recipe:", recipeId);
        
        this.$router.push({
          name: 'RecipeDetailPage',  // Changed from 'recipe-details' to 'RecipeDetailPage'
          params: { id: recipeId }
        }).catch(err => {
          console.error("Navigation failed:", err);
          // Fallback using path
          this.$router.push(`/recipe/${recipeId}`);
        });
        return;
      }

      // Handle Edamam recipes
      if (recipe.uri) {
        console.log("Routing to Edamam recipe with URI:", recipe.uri);
        const recipeId = encodeURIComponent(recipe.uri);
        this.$router.push({ 
          name: 'RecipeDetails', 
          params: { 
            id: recipeId 
          } 
        });
        return;
      }

      // Try to construct URI from URL if available
      if (recipe.url) {
        console.log("Constructing URI from URL:", recipe.url);
        const urlMatch = recipe.url.match(/\/recipe\/(.*)/);
        if (urlMatch) {
          const recipeId = encodeURIComponent(`http://www.edamam.com/ontologies/edamam.owl#recipe_${urlMatch[1]}`);
          this.$router.push({ 
            name: 'RecipeDetails', 
            params: { 
              id: recipeId 
            } 
          });
          return;
        }
      }

      // If we have an ID but no URI/URL, treat it as a community recipe
      if (recipe.id) {
        console.log("Falling back to recipe ID for routing:", recipe.id);
        this.$router.push({ 
          name: 'RecipeDetailPage',  // Changed from 'RecipeDeComponent' to 'RecipeDetailPage'
          params: { 
            id: recipe.id
          } 
        }).catch(err => {
          console.error("Navigation failed:", err);
          // Fallback to path-based routing
          this.$router.push(`/recipe/${recipe.id}`);
        });
        return;
      }

      console.error('Unable to determine recipe source or construct valid route');
    }
  }
};
</script>

<style scoped>
/* Styles remain unchanged */
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
