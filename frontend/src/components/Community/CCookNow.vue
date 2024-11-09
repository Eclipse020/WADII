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
  addDoc 
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
    // Access the query parameters
    if (this.$route.query.requiredIngredients) {
      this.requiredIngredients = JSON.parse(this.$route.query.requiredIngredients);
    }
    if (this.$route.query.fridgeIngredients) {
      this.fridgeIngredients = JSON.parse(this.$route.query.fridgeIngredients);
    }

    // Log to ensure values are correctly set
    console.log('Required Ingredients:', this.requiredIngredients);
    console.log('Fridge Ingredients:', this.fridgeIngredients);

    // Listen for auth state changes
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.currentUserId = user.uid;
        await this.getCurrentUserItems();  // Load user's items
      } else {
        this.currentUserId = null;  // If no user is authenticated, reset user ID
      }
    });
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
  
};
</script>

