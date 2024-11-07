<template>
  <div class="fridge">
    <!-- Added Recipe Ingredients Section -->
    <div class="recipe-ingredients">
      <div class="recipe-ingredients__content">
        <header class="recipe-ingredients__header">
          <h2 class="recipe-ingredients__title">Recipe Ingredients Required</h2>
        </header>
        
        <section class="recipe__ingredients">
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
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc 
} from "firebase/firestore";

export default {
  name: 'CookNow',

  props: {
    requiredIngredients: {
      type: Array,
      default: () => []
    },
    fridgeIngredients: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      currentUserId: null,
      items: [],
      originalItems: {}, // Store original quantities
      collapsedCategories: {},
      isCategoryAscending: false,
      sortOrder: 'asc',
      itemsToDelete: new Set(), // Track items marked for deletion
    };
  },

  computed: {
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

        alert('All changes saved successfully! 🎉');
        window.location.href = "http://localhost:8080/recipes";
      } catch (error) {
        console.error("Error saving changes: ", error);
        alert('Error saving changes. Please try again. ❌');
      }
    }
  },
  
  mounted() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.currentUserId = user.uid;
        await this.getCurrentUserItems();
      }
    });
  }
};
</script>

<style scoped>
.recipe-ingredients {
  margin-bottom: 2rem;
  padding: 0 2rem;
}

.recipe-ingredients__content {
  background-color: #ffffff;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.recipe-ingredients__header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.recipe-ingredients__title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

/* Copied Recipe Ingredients Styles from RecipeDetails */
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
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.recipe__ingredient:hover {
  transform: translateY(-2px);
}

.recipe__ingredient--available {
  border-left: 4px solid #4a8c3a;
}

.fridge {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.fridge__container {
  max-width: 1200px;
  margin: 0 auto;
}

.fridge__content {
  background-color: #ffffff;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.fridge__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.fridge__title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.fridge__controls {
  display: flex;
  gap: 1rem;
}

.fridge__button {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: none;
  background-color: #6c757d;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.fridge__button:hover:not(:disabled) {
  background-color: #5a6268;
  transform: translateY(-1px);
}

.fridge__button:disabled {
  background-color: #adb5bd;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 3rem;
}

.empty-state__text {
  font-size: 1.25rem;
  color: #6c757d;
  margin-bottom: 2rem;
}

.empty-state__image {
  max-width: 300px;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.category {
  margin-bottom: 2rem;
}

.category__header {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.category__header:hover {
  background-color: #e9ecef;
}

.category__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.category__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.ingredient {
  background-color: #ffffff;
  border-radius: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 100%;
}

.ingredient:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.ingredient--expiring {
  border: 2px solid #dc3545;
}

.ingredient--empty {
  opacity: 0.7;
  background-color: #f8f9fa;
}

.ingredient__body {
  padding: 1.25rem;
}

.ingredient__title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
  text-align: center;
}

.ingredient__info {
  text-align: center;
}

.ingredient__expiry {
  color: #6c757d;
  margin-bottom: 1rem;
}

.ingredient__controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.ingredient__button {
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  border: none;
  background-color: #6c757d;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ingredient__button:hover:not(:disabled) {
  background-color: #5a6268;
}

</style>