<template>
  <div class="fridge">
    <!-- Added Recipe Ingredients Section -->
    <div class="recipe-ingredients">
      <div class="recipe-ingredients__content">
        <header class="recipe-ingredients__header">
          <h2 class="recipe-ingredients__title">Recipe Ingredients Required</h2>
        </header>
        
        <section v-if="requiredIngredients.length" class="recipe__ingredients">
          <ul class="recipe__ingredients-list">
            <li 
              v-for="(ingredient, index) in requiredIngredients" 
              :key="index" 
              class="recipe__ingredient"
              :class="{ 'recipe__ingredient--available': fridgeIngredients.includes(ingredient) }"
            >
              {{ ingredient }}
            </li>
          </ul>
        </section>
      </div>
    </div>
    <div class="fridge__container">
      <div class="fridge__content">
        <header class="fridge__header">
          <h2 class="fridge__title">Edit your fridge items here! 🧊</h2>
          <div class="fridge__controls">
            <button 
              class="fridge__button fridge__button--sort" 
              @click="sortByCategory"
            >
              Category 📑 
              <span v-if="isCategoryAscending">↑</span>
              <span v-else>↓</span>
            </button>
            <button 
              class="fridge__button fridge__button--save" 
              @click="saveAllChanges" 
              :disabled="!hasChanges"
            >
              Save All Changes 💾
            </button>
          </div>
        </header>

        <div v-if="!items || items.length === 0" class="empty-state">
          <p class="empty-state__text">Your Fridge is Empty! Add some ingredients first~ 🥕</p>
          <img 
            class="empty-state__image" 
            src="../../assets/emptyFridge.jpg" 
            alt="Empty Fridge"
          >
        </div>

        <!-- Categorized Items -->
        <div 
          v-for="(itemsInCategory, category) in categorizedItems" 
          :key="category" 
          class="category"
        >
          <div 
            class="category__header" 
            @click="toggleCategory(category)"
          >
            <h5 class="category__title">
              {{ category }} {{ getCategoryEmoji(category) }}
            </h5>
          </div>
          
          <div 
            v-if="!collapsedCategories[category]" 
            class="category__grid"
          >
            <div 
              v-for="item in itemsInCategory" 
              :key="item.id" 
              class="ingredient"
              :class="{ 
                'ingredient--expiring': item.isExpiringSoon,
                'ingredient--empty': item.quantity === 0 
              }"
            >
              <div class="ingredient__body">
                <h6 class="ingredient__title">
                  {{ item.name }} {{ getIngredientEmoji(item.name) }}
                </h6>
                <div class="ingredient__info">
                  <p class="ingredient__expiry">
                    Expiry Date: {{ item.expiryDate }} ⏰
                  </p>
                  <div class="ingredient__controls">
                    <button 
                      class="ingredient__button"
                      @click="decrementQuantity(item)"
                      :disabled="item.quantity <= 0"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span class="ingredient__quantity">{{ item.quantity }}</span>
                    <button 
                      class="ingredient__button"
                      @click="incrementQuantity(item)"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <div 
                    v-if="hasItemChanged(item)" 
                    class="ingredient__original"
                  >
                    Original: {{ getOriginalQuantity(item.id) }} 📝
                  </div>
                  <div 
                    v-if="item.quantity === 0" 
                    class="ingredient__warning"
                  >
                    This item will be removed when changes are saved ⚠️
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { db, auth } from '../../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import '../../styles/components/community/ccooknow.css';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  query,
  where 
} from "firebase/firestore";

export default {
  name: 'CCookNow',
  
  data() {
    return {
      currentUserId: null,
      items: [],
      originalItems: {}, // Store original quantities
      collapsedCategories: {},
      isCategoryAscending: false,
      sortOrder: 'asc',
      itemsToDelete: new Set(), // Track items marked for deletion
      requiredIngredients: [],
      fridgeIngredients: [],
    };
  },

  mounted() {
    // Previous mounted code remains unchanged
    if (this.$route.query.requiredIngredients) {
      this.requiredIngredients = JSON.parse(this.$route.query.requiredIngredients);
    }
    if (this.$route.query.fridgeIngredients) {
      this.fridgeIngredients = JSON.parse(this.$route.query.fridgeIngredients);
    }

    console.log('Required Ingredients:', this.requiredIngredients);
    console.log('Fridge Ingredients:', this.fridgeIngredients);

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.currentUserId = user.uid;
        await this.getCurrentUserItems();
      } else {
        this.currentUserId = null;
      }
    });
  },

  computed: {
    // Previous computed properties remain unchanged
    categorizedItems() {
      const categorized = {};
      this.items.forEach(item => {
        if (!categorized[item.category]) {
          categorized[item.category] = [];
        }
        categorized[item.category].push(item);
      });
      return categorized;
    },

    hasChanges() {
      return this.items.some(item => 
        this.hasItemChanged(item) || 
        this.itemsToDelete.has(item.id)
      );
    }
  },

  methods: {
    async getCurrentUserItems() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (this.currentUserId) {
        try {
          const querySnapshot = await getDocs(
            collection(db, `users/${this.currentUserId}/items`)
          );
          this.items = [];
          querySnapshot.forEach((doc) => {
            const itemData = { id: doc.id, ...doc.data() };
            const expiryDate = new Date(itemData.expiryDate);
            const daysUntilExpiry = (expiryDate - today) / (1000 * 60 * 60 * 24);
            itemData.isExpiringSoon = daysUntilExpiry <= 3;
            
            this.items.push(itemData);
            this.originalItems[itemData.id] = itemData.quantity;
          });
          this.sortItems();
        } catch (error) {
          console.error("Error fetching items: ", error);
        }
      }
    },

    toggleCategory(category) {
      this.collapsedCategories[category] = !this.collapsedCategories[category];
    },

    sortByCategory() {
      this.isCategoryAscending = !this.isCategoryAscending;
      this.items.sort((a, b) => {
        const comparison = a.category.localeCompare(b.category);
        return this.isCategoryAscending ? comparison : -comparison;
      });
    },

    sortItems() {
      this.items.sort((a, b) => a.name.localeCompare(b.name));
    },

    incrementQuantity(item) {
      if (item.quantity === 0) {
        this.itemsToDelete.delete(item.id);
      }
      item.quantity++;
    },

    decrementQuantity(item) {
      if (item.quantity > 0) {
        item.quantity--;
        if (item.quantity === 0) {
          this.itemsToDelete.add(item.id);
        }
      }
    },

    hasItemChanged(item) {
      return this.originalItems[item.id] !== item.quantity;
    },

    getOriginalQuantity(itemId) {
      return this.originalItems[itemId];
    },

    getCategoryEmoji(category) {
      const emojiMap = {
        'Vegetables': '🥬',
        'Fruits': '🍎',
        'Meat': '🥩',
        'Dairy': '🥛',
        'Grains': '🌾',
        'Seafood': '🐟',
        'Condiments': '🧂',
        'Beverages': '🥤',
        'Snacks': '🍿',
        'Other': '📦'
      };
      return emojiMap[category] || '🔍';
    },

    getIngredientEmoji(name) {
      const emojiMap = {
        'Apple': '🍎',
        'Banana': '🍌',
        'Carrot': '🥕',
        'Milk': '🥛',
        'Egg': '🥚',
        'Chicken': '🍗',
        'Fish': '🐟',
        'Rice': '🍚',
        'Bread': '🍞'
      };
      return emojiMap[name] || '';
    },

    async moveToUsedItems(item) {
      try {
        await addDoc(
          collection(db, `users/${this.currentUserId}/usedItems`), 
          {
            ...item,
            usedAt: new Date().toISOString(),
            originalQuantity: this.originalItems[item.id],
            finalQuantity: 0
          }
        );
      } catch (error) {
        console.error("Error moving item to used items: ", error);
      }
    },
   // Previous methods remain unchanged until markRecipeAsCompleted

    async markRecipeAsCompleted() {
      if (!this.currentUserId) return;

      try {
        // Get the recipe ID from the route query parameters
        const recipeId = this.$route.query.recipeId;
        if (!recipeId) return;

        // 1. Delete from meal plans
        const mealPlansRef = collection(db, `users/${this.currentUserId}/mealPlans`);
        const mealPlansQuery = query(mealPlansRef, where("recipe.communityRecipeId", "==", recipeId));
        const mealPlansSnapshot = await getDocs(mealPlansQuery);

        const mealPlanDeletePromises = mealPlansSnapshot.docs.map(doc => 
          deleteDoc(doc.ref)
        );

        // 2. Delete from community recipes
        const communityRecipesRef = collection(db, 'communityRecipes');
        const communityRecipesQuery = query(communityRecipesRef, where("id", "==", recipeId));
        const communityRecipesSnapshot = await getDocs(communityRecipesQuery);

        const communityRecipeDeletePromises = communityRecipesSnapshot.docs.map(doc => 
          deleteDoc(doc.ref)
        );

        // Execute all deletions
        await Promise.all([
          ...mealPlanDeletePromises,
          ...communityRecipeDeletePromises
        ]);

        console.log('Successfully deleted recipe from meal plan and community recipes');

      } catch (error) {
        console.error("Error deleting recipe:", error);
        throw error;
      }
    },

    async saveAllChanges() {
      try {
        // Handle items to be updated (quantity > 0)
        const itemsToUpdate = this.items.filter(item => 
          this.hasItemChanged(item) && item.quantity > 0
        );

        // Update quantities for remaining items
        for (const item of itemsToUpdate) {
          const itemRef = doc(
            db, 
            `users/${this.currentUserId}/items`, 
            item.id
          );
          await updateDoc(itemRef, {
            quantity: item.quantity
          });
          this.originalItems[item.id] = item.quantity;
        }

        // Handle items to be deleted (quantity = 0)
        const itemsToDelete = this.items.filter(item => item.quantity === 0);
        for (const item of itemsToDelete) {
          await this.moveToUsedItems(item);
          
          const itemRef = doc(
            db, 
            `users/${this.currentUserId}/items`, 
            item.id
          );
          await deleteDoc(itemRef);
          
          this.items = this.items.filter(i => i.id !== item.id);
          delete this.originalItems[item.id];
          this.itemsToDelete.delete(item.id);
        }

        // Delete the recipe from meal plan and community recipes
        await this.markRecipeAsCompleted();

        alert('All changes saved successfully! 🎉');
        
        // Force refresh the meal planner by adding a timestamp to the URL
        const timestamp = new Date().getTime();
        window.location.pathname = `/recipes?t=${timestamp}`;
      } catch (error) {
        console.error("Error saving changes:", error);
        alert('Error saving changes. Please try again. ❌');
      }
    },

    // Rest of the methods remain unchanged
  },
};
</script>

<style scoped>
/* Previous styles remain unchanged */
/* CookNow Base Styles */
.fridge {
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
  
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  padding: 2rem;
  background-color: var(--color-background);
  min-height: 100vh;
}

/* Recipe Ingredients Section */
.recipe-ingredients {
  max-width: 1200px;
  margin: 0 auto 2rem;
}

.recipe-ingredients__content {
  background-color: white;
  border-radius: var(--border-radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-md);
}

.recipe-ingredients__header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--color-background);
}

.recipe-ingredients__title {
  font-size: 2rem;
  color: var(--color-primary);
  margin: 0;
  position: relative;
  padding-bottom: 1rem;
}

.recipe-ingredients__title::after {
  content: '📝';
  display: inline-block;
  margin-left: 0.5rem;
}

/* Recipe Ingredients List */
.recipe__ingredients {
  margin: 2rem 0;
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
  padding: 1.25rem;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid var(--color-background);
}

.recipe__ingredient:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.recipe__ingredient--available {
  border-left: 4px solid var(--color-primary);
  background-color: var(--color-background-light);
}

/* Fridge Section */
.fridge__container {
  max-width: 1200px;
  margin: 0 auto;
}

.fridge__content {
  background-color: white;
  border-radius: var(--border-radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-md);
}

.fridge__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--color-background);
}

.fridge__title {
  font-size: 2rem;
  color: var(--color-primary);
  margin: 0;
  position: relative;
}

.fridge__controls {
  display: flex;
  gap: 1rem;
}

.fridge__button {
  padding: 0.75rem 1.5rem;
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

.fridge__button--sort {
  background-color: var(--color-primary-light);
  color: white;
}

.fridge__button--save {
  background-color: var(--color-primary);
  color: white;
}

.fridge__button:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
  transform: translateY(-2px);
}

.fridge__button:disabled {
  background-color: var(--color-text-light);
  cursor: not-allowed;
  opacity: 0.7;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem;
  background-color: var(--color-background-light);
  border-radius: var(--border-radius-lg);
  margin: 2rem 0;
}

.empty-state__text {
  font-size: 1.5rem;
  color: var(--color-text);
  margin-bottom: 2rem;
}

.empty-state__image {
  max-width: 300px;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
}

/* Category Section */
.category {
  margin-bottom: 2rem;
}

.category__header {
  background-color: var(--color-background-light);
  padding: 1rem 1.5rem;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.category__header:hover {
  background-color: var(--color-background);
  transform: translateX(5px);
}

.category__title {
  font-size: 1.5rem;
  color: var(--color-primary-dark);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.category__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
  padding: 0.5rem;
}

/* Ingredient Cards */
.ingredient {
  background-color: white;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  border: 1px solid var(--color-background);
  overflow: hidden;
}

.ingredient:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.ingredient--expiring {
  border: 2px solid #dc3545;
  position: relative;
}

.ingredient--expiring::before {
  content: '⚠️ Expiring Soon!';
  position: absolute;
  top: 0;
  right: 0;
  background-color: #dc3545;
  color: white;
  padding: 0.25rem 0.75rem;
  border-bottom-left-radius: var(--border-radius-sm);
  font-size: 0.8rem;
}

.ingredient--empty {
  opacity: 0.7;
  background-color: var(--color-background-light);
}

.ingredient__body {
  padding: 1.5rem;
}

.ingredient__title {
  font-size: 1.25rem;
  color: var(--color-primary);
  margin-bottom: 1rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.ingredient__info {
  text-align: center;
}

.ingredient__expiry {
  color: var(--color-text-light);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.ingredient__controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0;
}

.ingredient__button {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: none;
  background-color: var(--color-primary);
  color: white;
  font-weight: 600;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ingredient__button:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
  transform: scale(1.1);
}

.ingredient__button:disabled {
  background-color: var(--color-text-light);
  cursor: not-allowed;
}

.ingredient__quantity {
  font-size: 1.25rem;
  color: var(--color-text);
  font-weight: 600;
  min-width: 2.5rem;
}

.ingredient__original {
  color: var(--color-text-light);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.ingredient__warning {
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .fridge {
    padding: 1rem;
  }
  
  .recipe-ingredients__content,
  .fridge__content {
    padding: 1rem;
  }
  
  .fridge__header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .fridge__controls {
    flex-direction: column;
    width: 100%;
  }
  
  .fridge__button {
    width: 100%;
    justify-content: center;
  }
  
  .category__grid {
    grid-template-columns: 1fr;
  }
}
</style>
