<template>
    <div id="cookNow">
      <div class="container-fluid">
        <div class="content">
          <header class="my-3 d-flex justify-content-between align-items-center">
            <h2>Cook Now 🥘</h2>
            <div>
              <button class="btn btn-sm me-2 topButtons" @click="sortByCategory">
                Category <span v-if="isCategoryAscending">&#8593;</span><span v-else>&#8595;</span>
              </button>
              <button class="btn btn-sm topButtons" @click="saveAllChanges" :disabled="!hasChanges">
                Save All Changes
              </button>
            </div>
          </header>
  
          <div v-if="!items || items.length === 0" class="text-center my-4">
            <p>Your Fridge is Empty! Add some ingredients first~ 🥕</p>
            <img class="img-fluid" style="width: 300px" src="../../assets/emptyFridge.jpg" alt="Empty Fridge">
          </div>
  
          <!-- Categorized Items -->
          <div v-for="(itemsInCategory, category) in categorizedItems" :key="category" class="mb-4">
            <div class="categoryHeader">
              <div class="category-container">
                <h5 class="m-0 flex-grow-1 d-flex align-items-start category-title" @click="toggleCategory(category)">
                  {{ category }}
                </h5>
              </div>
            </div>
            
            <div v-if="!collapsedCategories[category]" class="row g-4">
              <div v-for="item in itemsInCategory" :key="item.id" class="col-sm-6 col-md-4 col-lg-3">
                <div class="card mb-4 mx-4 ingredient-card" 
                  :class="{ 
                    'expiring-soon': item.isExpiringSoon,
                    'zero-quantity': item.quantity === 0 
                  }">
                  <div class="card-body">
                    <h6 class="card-title">{{ item.name }}</h6>
                    <div class="card-info">
                      <p class="card-text">Expiry Date: {{ item.expiryDate }}</p>
                      <div class="quantity-control">
                        <button 
                          class="btn btn-sm btn-secondary" 
                          @click="decrementQuantity(item)"
                          :disabled="item.quantity <= 0"
                        >-</button>
                        <span class="mx-2">{{ item.quantity }}</span>
                        <button 
                          class="btn btn-sm btn-secondary" 
                          @click="incrementQuantity(item)"
                        >+</button>
                      </div>
                      <div v-if="hasItemChanged(item)" class="mt-2">
                        <small class="text-muted">Original: {{ getOriginalQuantity(item.id) }}</small>
                      </div>
                      <div v-if="item.quantity === 0" class="mt-2 text-danger">
                        <small>This item will be removed when changes are saved</small>
                      </div>
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
  import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";
  import 'bootstrap/dist/css/bootstrap.min.css';
  
  export default {
    name: 'CookNow',
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
            const querySnapshot = await getDocs(collection(db, `users/${this.currentUserId}/items`));
            this.items = [];
            querySnapshot.forEach((doc) => {
              const itemData = { id: doc.id, ...doc.data() };
              const expiryDate = new Date(itemData.expiryDate);
              const daysUntilExpiry = (expiryDate - today) / (1000 * 60 * 60 * 24);
              itemData.isExpiringSoon = daysUntilExpiry <= 3;
              
              this.items.push(itemData);
              // Store original quantity
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
        if (this.sortOrder === 'asc') {
          this.items.sort((a, b) => a.category.localeCompare(b.category));
          this.sortOrder = 'desc';
        } else {
          this.items.sort((a, b) => b.category.localeCompare(a.category));
          this.sortOrder = 'asc';
        }
      },
  
      sortItems() {
        this.items.sort((item1, item2) => {
          return item1.name.localeCompare(item2.name);
        });
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
  
      async moveToUsedItems(item) {
        try {
          // Add to usedItems collection with timestamp
          await addDoc(collection(db, `users/${this.currentUserId}/usedItems`), {
            ...item,
            usedAt: new Date().toISOString(),
            originalQuantity: this.originalItems[item.id],
            finalQuantity: 0
          });
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
            const itemRef = doc(db, `users/${this.currentUserId}/items`, item.id);
            await updateDoc(itemRef, {
              quantity: item.quantity
            });
            this.originalItems[item.id] = item.quantity;
          }
  
          // Handle items to be deleted (quantity = 0)
          const itemsToDelete = this.items.filter(item => item.quantity === 0);
          for (const item of itemsToDelete) {
            // Move to usedItems collection before deletion
            await this.moveToUsedItems(item);
            
            // Delete from items collection
            const itemRef = doc(db, `users/${this.currentUserId}/items`, item.id);
            await deleteDoc(itemRef);
            
            // Remove from local arrays/objects
            this.items = this.items.filter(i => i.id !== item.id);
            delete this.originalItems[item.id];
            this.itemsToDelete.delete(item.id);
          }
  
          alert('All changes saved successfully!');
        } catch (error) {
          console.error("Error saving changes: ", error);
          alert('Error saving changes. Please try again.');
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
  .ingredient-card {
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .ingredient-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  .expiring-soon {
    border: 2px solid #dc3545;
  }
  
  .zero-quantity {
    opacity: 0.7;
    background-color: #f8f9fa;
  }
  
  .quantity-control {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
  }
  
  .quantity-control button {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }
  
  .category-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f8f9fa;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 10px;
    cursor: pointer;
  }
  
  .category-title {
    font-weight: 600;
    color: #333;
  }
  
  .topButtons {
    background-color: #6c757d;
    color: white;
  }
  
  .topButtons:disabled {
    background-color: #adb5bd;
  }
  
  .card-info {
    text-align: center;
  }
  </style>