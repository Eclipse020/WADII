<template>
  <div class="app-fridge">
    <div class="container-fluid">
      <div class="content">
        <header class="app-fridge__header">
          <div>
            <button class="btn btn-sm me-2 my-2 app-fridge__button--top" @click="sortByCategory" :disabled="openAddCard">
              Category &nbsp; <span v-if="isCategoryAscending">&#8681;</span><span v-else>&#8679;</span>
            </button>
            <button class="btn btn-sm me-2 my-2 app-fridge__button--top" @click="navigateTo('summary')"
              :disabled="openAddCard">View Inventory Summary</button>
            <!--Add Product + Edit Product Card-->
            <button v-if="!openAddCard && !isEditing" @click="openAddCard = true"
              class="btn btn-sm my-2 app-fridge__button--top">
              Add Product
            </button>
            <div v-else class="card app-fridge__add-card">
              <div class="app-fridge__card-body">
                <div class="app-fridge__card-title">
                  <h5 class="app-fridge__title">{{ isEditing ? 'Edit Product' : 'Add Product' }}
                    &#129365;&#127815;&#127838;&#129367;</h5>
                  <button @click="closeAddCard" class="btn btn-light app-fridge__button--close">X</button>
                </div>
                <hr />
                <p v-if="validationError" class="app-fridge__error-message">{{ validationError }}</p>
                <form @submit.prevent="isEditing ? saveEdit() : addItem()">
                  <div class="mb-3">
                    <label for="itemName">Name</label>
                    <input v-model="itemName" class="form-control" type="text" id="itemName" maxlength="20"
                      placeholder="Insert Name" required />
                  </div>
                  <div class="mb-3">
                    <label for="category">Category</label>
                    <select v-model="itemCategory" class="form-select" id="category" required>
                      <option disabled value="" selected>Please Select</option>
                      <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label for="quantity">Quantity</label>
                    <input v-model="itemQuantity" class="form-control" type="number" id="quantity" min="1"
                      placeholder="1" required />
                  </div>
                  <div class="mb-3">
                    <label for="expiryDate">Expiry Date</label>
                    <input v-model="itemExpiryDate" class="form-control" type="date" id="expiryDate" required />
                  </div>
                  <button type="submit" class="btn btn-success app-fridge__button--add">{{ isEditing ? 'Save' : 'Add!'
                    }}</button>
                </form>
              </div>
            </div>
          </div>
        </header>
        <p class="text-center mt-5" v-if="!items || items.length === 0">
          Your Fridge is Empty ~&#127810;<br>
          <img class="img-fluid d-block mx-auto" style="width: 300px;" src="@/assets/emptyFridge.jpg" alt="Empty Fridge">
        </p>
        <!-- Categorized Items -->
        <div v-for="(itemsInCategory, category) in finalItems" :key="category" class="col-12">
          <div class="appFridge__category-header">
            <div class="appFridge__category-container">
              <h5 class="m-0 flex-grow-1 d-flex align-items-start appFridge__category-title" 
                  @click="toggleCategory(category)">
                {{ category }} &nbsp;
                <span v-if="!collapsedCategories[category]">&#8679;</span>
                <span v-else>&#8681;</span>
              </h5>
              <div class="appFridge__sort-button">
                <button class="btn btn-sm me-2 appFridge__button--sort"
                  @click="sortCategorizedItems(category, 'quantity')" :disabled="openAddCard"> Sort by Quantity
                </button>
                <button class="btn btn-sm appFridge__button--sort" @click="sortCategorizedItems(category, 'expiryDate')"
                  :disabled="openAddCard"> Sort by Expiry Date </button>
              </div>
            </div>
          </div>
          <div v-if="!collapsedCategories[category]" class="row g-4">
            <div v-for="item in itemsInCategory" :key="item.id" class="col-sm-6 col-md-4 col-lg-3 col-xl-2">
              <div class="card mb-4 mx-4 app-fridge__filter-card"
                :class="{ 'app-fridge__expiring-soon': item.isExpiringSoon }">
                <div class="card-body">
                  <h6 class="card-title">{{ item.name }}</h6>
                  <div class="card-info">
                    <p :class="{'app-fridge__expiry-date-expiring-soon': item.isExpiringSoon}" class="app-fridge__card-text">Expiry Date: {{ item.expiryDate }}</p>
                    <p class="app-fridge__card-text">Quantity: {{ item.quantity }}</p>
                  </div>
                  <div class="mt-auto d-flex flex-column">
                    <button class="btn btn-secondary btn-sm mb-1 app-fridge__card-btn " @click="editItem(item)"
                      :disabled="openAddCard">Edit</button>
                    <button class="btn btn-danger btn-sm app-fridge__card-btn " @click="deleteItem(item.id)"
                      :disabled="openAddCard">Delete</button>
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
import { getDocs, collection, getDoc, addDoc, deleteDoc, doc, updateDoc, where, query } from "firebase/firestore";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/components/fridge/fridge.css';
import '../../styles/main.css';

export default {
  name: 'FridgePage',
  data() {
    return {
      currentUserId: null,
      //Items retrieved from Database: Start
      items: [],
      //Items retrieved from Database: End

      //Sort: Start
      sortedItems: {},
      sortOrder: 'asc',
      isCategoryAscending: false,
      //Sort: End

      //Add Items: Start
      openAddCard: false,
      itemId: '',
      itemName: '',
      itemCategory: '',
      itemQuantity: 1,
      itemExpiryDate: '',
      validationError: '',
      isEditing: false,
      itemToEdit: null,
      //Add Items: End

      categories: ["Dairy", "Fruits", "Vegetables", "Meats", "Seafood", "Grains and Cereals",
        "Nuts and Seeds", "Legumes", "Beverages", "Snacks", "Condiments and Sauces",
        "Herbs and Spices", "Frozen Foods", "Baked Goods", "Canned and Jarred Goods",
        "Deli", "Prepared Meals", "Pantry Staples", "Breakfast Foods", "Sweets and Desserts",
        "Non-Alcoholic Drinks", "Alcoholic Drinks", "Others"],

      //Collapsed: Start
      collapsedCategories: {},
      //Collapsed: End

      toggledCategories: [],
    };
  },
  methods: {

    //Collapsed: Start
    toggleCategory(categoryName) {
      this.collapsedCategories[categoryName] = !this.collapsedCategories[categoryName];
    },
    //Collapsed: End

    navigateTo(page) {
      if (page === 'summary') {
        this.$router.push({ name: 'Summary' });
      } else if (page === 'customize') {
        this.$router.push({ name: 'Customize' });
      }
    },

    //Get Database: Start
    async getCurrentUserItems() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (this.currentUserId) {
        try {
          const itemsCollection = collection(db, `users/${this.currentUserId}/items`);
          const querySnapshot = await getDocs(itemsCollection); // Fetch items once

          this.items = []; // Clear the current items
          querySnapshot.forEach((doc) => {
            const itemData = { id: doc.id, ...doc.data() };
            const expiryDate = new Date(itemData.expiryDate);
            const daysUntilExpiry = (expiryDate - today) / (1000 * 60 * 60 * 24);
            itemData.isExpiringSoon = daysUntilExpiry <= 3; // Adjust threshold as needed

            this.items.push(itemData);
          });
          this.sortItems('name'); // Call sort after updating items
        } catch (error) {
          console.error("Error fetching items: ", error);
        }
      }
    },

    //Get Database: End

    //Sort Items: Start
    sortByCategory() {
      this.isCategoryAscending = !this.isCategoryAscending;
      if (this.sortOrder === 'asc') {
        this.items.sort((a, b) => a.category.localeCompare(b.category)); // Sort A to Z
        this.sortOrder = 'desc';
      } else {
        this.items.sort((a, b) => b.category.localeCompare(a.category)); // Sort Z to A
        this.sortOrder = 'asc';
      }
    },

    sortItems() {
      this.items.sort((item1, item2) => {
        return item1.name.localeCompare(item2.name);
      });
    },

    sortCategorizedItems(category, sortBy) {
      if (!this.categorizedItems[category]) {
        console.error(`No items found for category: ${category}`);
        return;
      }
      const sorted = [...this.categorizedItems[category]];
      if (sortBy === 'quantity') {
        sorted.sort((a, b) => a.quantity - b.quantity);
      } else if (sortBy === 'expiryDate') {
        sorted.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
      } else {
        console.error(`Unknown sort criteria: ${sortBy}`);
        return;
      }
      this.sortedItems[category] = sorted;
      console.log(`Sorted ${category} by ${sortBy}`, sorted);
    },
    //Sort Items: End

    //Add Item: Start
    closeAddCard() {
      this.openAddCard = false;
      this.validationError = '',
        this.resetForm();
    },

    async addItem() {
      this.validationError = '';

      console.log("Adding Item:", {
        name: this.itemName,
        category: this.itemCategory,
        expiryDate: this.itemExpiryDate
      });

      // Check for duplicate items
      const duplicateItem = this.items.find(item =>
        item.name.toLowerCase() === this.itemName.toLowerCase() &&
        item.category === this.itemCategory &&
        item.expiryDate === this.itemExpiryDate
      );

      if (duplicateItem) {
        this.validationError = "An item with this name and category already exists.";
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expiryDate = new Date(this.itemExpiryDate);
      expiryDate.setHours(0, 0, 0, 0);

      if (expiryDate < today) {
        this.validationError = "The expiry date must be set to a date after today."
        return;
      }

      const daysUntilExpiry = (expiryDate - today) / (1000 * 60 * 60 * 24);
      const isExpiringSoon = daysUntilExpiry <= 3;

      let editedName = this.capitalizeFirstLetter(this.itemName);

      console.log("Item to add:", {
        name: editedName,
        category: this.itemCategory,
        quantity: this.itemQuantity,
        expiryDate: this.itemExpiryDate,
        isExpiringSoon: isExpiringSoon,
        createdDate: new Date().toISOString(),
      });


      try {
        const docRef = await addDoc(collection(db, `users/${this.currentUserId}/items`), {
          name: editedName,
          category: this.itemCategory,
          quantity: this.itemQuantity,
          expiryDate: this.itemExpiryDate,
          isExpiringSoon: isExpiringSoon,
          createdDate: new Date().toISOString(),
        });

        const newItem = {
          id: docRef.id,
          name: editedName,
          category: this.itemCategory,
          quantity: this.itemQuantity,
          expiryDate: this.itemExpiryDate,
          isExpiringSoon: isExpiringSoon,
          createdDate: new Date().toISOString(),
        };

        this.items.push(newItem);
        this.sortItems('name');

        // Reset the form inputs
        this.resetForm();
        this.openAddCard = false;

      } catch (error) {
        console.error("Error adding item: ", error);
      }
    },

    resetForm() {
      this.itemId = null;
      this.itemName = '';
      this.itemCategory = '';
      this.itemQuantity = 1;
      this.itemExpiryDate = '';
      this.validationError = '';
      this.isEditing = false;
      this.isExpiringSoon = false;
      this.itemToEdit = null;
      this.openAddCard = false;
    },

    editItem(item) {
      this.isEditing = true;
      this.itemName = item.name;
      this.itemCategory = item.category;
      this.itemExpiryDate = item.expiryDate;
      this.itemId = item.id;
      this.itemQuantity = item.quantity || 0;
      this.isExpiringSoon = item.isExpiringSoon || false;
      this.openAddCard = true;
    },

    async deleteItem(itemId) {
      const itemRef = doc(db, `users/${this.currentUserId}/items`, itemId);
      try {
        const itemData = await getDoc(itemRef);
        if (itemData.exists()) {
          await deleteDoc(itemRef);
          console.log("Item deleted.");
          this.items = this.items.filter(item => item.id !== itemId);
        } else {
          console.error("Item not found: ", itemId);
        }
      } catch (error) {
        console.error("Error deleting item: ", error);
      }
    },

    // async deleteItem(itemId) {
    //   const itemRef = doc(db, `users/${this.currentUserId}/items`, itemId);
    //   try {
    //     const itemData = await getDoc(itemRef);
    //     if (itemData.exists()) {
    //         await setDoc(doc(db, `users/${this.currentUserId}/deletedItems`, itemId), {
    //             name: itemData.data().name,
    //             category: itemData.data().category,
    //             deletedAt: new Date().toISOString()
    //         });
    //         await deleteDoc(itemRef);
    //         console.log("Item deleted and logged to deletedItems.");
    //         this.items = this.items.filter(item => item.id !== itemId);
    //     } else {
    //         console.error("Item not found: ", itemId);
    //     }
    //   } catch (error) {
    //     console.error("Error deleting item: ", error);
    //   }
    // },

    async saveEdit() {
      const updatedItem = {
        id: this.itemId,
        name: this.itemName,
        category: this.itemCategory,
        expiryDate: this.itemExpiryDate,
        quantity: this.itemQuantity || 0,
        isExpiringSoon: this.isExpiringSoon || false
      };

      const selectedDate = new Date(updatedItem.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        this.validationError = "Expiry date cannot be in the past.";
        return;
      }

      // Check if any other item with the same name, category, and expiry date exists
      const duplicateItem = await this.checkForDuplicateItem(
        updatedItem.name,
        updatedItem.category,
        updatedItem.expiryDate,
        updatedItem.id
      );
      
      if (duplicateItem) {
        this.validationError = "An item with this name and category already exists.";
        return;
      }

      this.updateItemInFirestore(updatedItem)
        .then(() => {
          this.resetForm();
        })
        .catch(error => {
          console.error("Error updating item: ", error);
        });
    },

    async checkForDuplicateItem(name, category, expiryDate, currentItemId) {
      try {
        const itemsRef = collection(db, `users/${this.currentUserId}/items`);
        const q = query(
          itemsRef,
          where("name", "==", name),
          where("category", "==", category),
          where("expiryDate", "==", expiryDate)
        );

        const querySnapshot = await getDocs(q);

        // Loop through the documents to see if there's any other item with the same properties
        for (const doc of querySnapshot.docs) {
          if (doc.id !== currentItemId) {  // Exclude the current item
            return true;  // Duplicate found
          }
        }
        return false;  // No duplicates found
      } catch (error) {
        console.error("Error checking for duplicates: ", error);
        return false;
      }
    },

    async updateItemInFirestore(item) {
      try {
        const itemRef = doc(db, `users/${this.currentUserId}/items`, item.id);
        await updateDoc(itemRef, {
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          expiryDate: item.expiryDate,
          isExpiringSoon: item.isExpiringSoon
        });


        const index = this.items.findIndex(existingItem => existingItem.id === item.id);
        if (index !== -1) {
          this.items[index] = item;
        }

        await this.getCurrentUserItems();

      } catch (error) {
        console.error("Error updating item in Firestore: ", error);
      }
    },

    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },

    //Add Item: End

    //Move to bin: Start
    async moveExpiredItemsToBin() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      try {
        for (const item of this.items) {
          const expiryDate = new Date(item.expiryDate);
          expiryDate.setHours(0, 0, 0, 0);

          // Check if the item is expired
          if (expiryDate < today) {
            // Move the expired item to the "bin" collection
            await addDoc(collection(db, `users/${this.currentUserId}/expiredItemsWOUsing`), {
              ...item,
              movedToBinAt: new Date().toISOString(), // Optionally add timestamp
            });

            // Remove the item from the "items" collection
            await deleteDoc(doc(db, `users/${this.currentUserId}/items`, item.id));

            console.log(`Moved expired item to bin: ${item.name}`);
          }
        }

        // Refresh the items list after moving expired items
        await this.getCurrentUserItems();

      } catch (error) {
        console.error("Error moving expired items to bin:", error);
      }
    },
    //Move to bin: End

    //Getting ingredients for MealPlanner
    getAvailableIngredients() {
      return this.items.map(item => item.name).join(',');
    }
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


    finalItems() {
      const result = {};
      for (const category in this.categorizedItems) {
        result[category] = this.sortedItems[category] || this.categorizedItems[category];
      }
      return result;
    },


  },
  mounted() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.currentUserId = user.uid;
        await this.getCurrentUserItems();
        await this.moveExpiredItemsToBin();
      }
    });
  },
};
</script>