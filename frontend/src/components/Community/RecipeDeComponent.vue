    RecipeDeComponent
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

        <div class="recipe-details__button-group">
        <!-- "Add to Favorites" Button -->
        <button @click="toggleFavorite" class="recipe-details__btn recipe-details__btn--favorite mx-2 shadow"
        :class="{'recipe-details__btn--success': !isFavorited, 'recipe-details__btn--secondary': isFavorited}">
        {{ isFavorited ? 'Remove from Favorites' : 'Add to Favorites' }}
        </button>

        <button 
            class="recipe__button recipe__button--primary recipe__button--completed shadow" 
            @click="CCookNow"
        >
            Mark as completed
        </button>
        </div>
    </div>
    </template>

    <script>
    import { getRecipeById } from '@/services/RecipeService';
    import { db, auth } from '../../services/firebase';
    import { onAuthStateChanged } from 'firebase/auth';
    import { collection, addDoc, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
    import '../../styles/components/community/recipedecomponent.css';


    export default {
    name: 'RecipeDeComponent',
    props: {
        recipeId: {
        type: String,
        required: true,
        fridgeItems: [],
        requiredIngredients: []
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
        favoriteRecipes: [],
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
    async CCookNow() {
        if (!this.currentUserId) return;

        const completedRecipe = {
        label: this.recipe.name,
        image: this.recipe.image,
        url: this.recipe.id,
        ingredientLines: this.recipe.ingredients,
        totalTime: this.recipe.estimatedTime,
        completionDate: new Date().toLocaleDateString()
      };
      console.log("Completed Recipe Data:", completedRecipe); // Log completedRecipe to check ingredients
        try {
        // Add to completed recipes
        const completedRecipesCollection = collection(db, `users/${this.currentUserId}/completedRecipes`);
        await addDoc(completedRecipesCollection, completedRecipe);

        // Delete from meal plan
        await this.deleteFromMealPlan();

        // Navigate to CCookNow page
        this.$router.push({ 
          name: 'CCookNow', 
          params: { id: this.$route.params.id },
          query: { 
            requiredIngredients: JSON.stringify(this.recipe.ingredients),
            fridgeIngredients: JSON.stringify(this.fridgeItems)
          }
        });
      } catch (error) {
        console.error("Error marking recipe as completed:", error);
      }
      console.log('Sending ingredients:', this.recipe.ingredients);
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
    },
    };
    
    </script>

<style scoped>
/* Recipe Page Base Styles */
.recipe-details {
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

.recipe-details {
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  padding: 2rem;
  background-color: var(--color-background);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  max-width: 1200px;
  margin: 2rem auto;
}

/* Image Section */
.recipe-details__image-wrapper {
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: var(--border-radius-md);
  margin-bottom: 2rem;
  cursor: pointer;
}

.recipe-details__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.recipe-details__image:hover {
  transform: scale(1.05);
}

.recipe-details__modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.recipe-details__full-image {
  max-width: 90%;
  max-height: 90vh;
  object-fit: contain;
}

/* Header Section */
.recipe-details__name {
  font-size: 2.5rem;
  color: var(--color-primary);
  margin-bottom: 1rem;
  position: relative;
  padding-bottom: 1rem;
  text-align: center;
}

.recipe-details__name::after {
  content: '👨‍🍳';
  display: inline-block;
  margin-left: 0.5rem;
}

.recipe-details__description {
  font-size: 1.2rem;
  color: var(--color-text-light);
  text-align: center;
  margin-bottom: 2rem;
}

/* Additional Info Section */
.recipe-details__additional-info {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0;
}

.recipe-details__info-item {
  background-color: white;
  padding: 1rem;
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Ingredients Section */
.recipe-details__section-title {
  color: var(--color-primary-dark);
  font-size: 1.5rem;
  margin: 2rem 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.recipe-details__section-title::before {
  content: '🥗';
}

.recipe-details__ingredients-list {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.recipe-details__ingredient-item {
  background-color: white;
  padding: 1rem;
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s;
}

.recipe-details__ingredient-item:hover {
  transform: translateY(-2px);
}

/* Steps Section */
.recipe-details__recipe-steps {
  background-color: var(--color-background-light);
  padding: 2rem;
  border-radius: var(--border-radius-md);
  margin: 2rem 0;
  box-shadow: var(--shadow-sm);
}



/* Button Group */
.recipe-details__button-group {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

.recipe-details__btn {
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

.recipe-details__btn--favorite {
  background-color: var(--color-primary-light);
  color: white;
}

.recipe-details__btn--favorite:hover {
  background-color: var(--color-primary);
  transform: translateY(-2px);
}

.recipe-details__btn--favorite::before {
  content: '⭐';
}

.recipe-details__btn--secondary {
  background-color: var(--color-primary-dark);
}

.recipe-details__btn--secondary::before {
  content: '★';
}

.recipe-details__btn--success {
  background-color: var(--color-primary-light);
}

/* Keep the existing recipe__button styles for consistency */
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

/* Responsive Design */
@media (max-width: 768px) {
  .recipe-details {
    padding: 1rem;
    margin: 1rem;
  }
  
  .recipe-details__name {
    font-size: 2rem;
  }
  
  .recipe-details__image-wrapper {
    height: 300px;
  }
  
  .recipe-details__additional-info {
    flex-direction: column;
    gap: 1rem;
  }
  
  .recipe-details__ingredients-list {
    grid-template-columns: 1fr;
  }
  
  .recipe-details__button-group {
    flex-direction: column;
  }
  
  .recipe-details__btn,
  .recipe__button {
    width: 100%;
  }
}
</style>