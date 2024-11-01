<template>
  <div class="add-item-page">
    <AddItem />
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import AddItem from '../components/Fridge/AddItem.vue';

<<<<<<< Updated upstream
export default defineComponent({
  name: 'AddItemPage',
  components: {
    AddItem
  }
});
=======
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
          const querySnapshot = await getDocs(collection(db, `users/${this.currentUserId}/items`));
          this.items = [];
          querySnapshot.forEach((doc) => {
            const itemData = { id: doc.id, ...doc.data() };
            const expiryDate = new Date(itemData.expiryDate);
            const daysUntilExpiry = (expiryDate - today) / (1000 * 60 * 60 * 24);
            itemData.isExpiringSoon = daysUntilExpiry <= 3; // Adjust threshold as needed

            this.items.push(itemData);
          });
          this.sortItems('name');
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

      this.updateItemInFirestore(updatedItem)
        .then(() => {
            this.resetForm();
        })
        .catch(error => {
            console.error("Error updating item: ", error);
        });
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
>>>>>>> Stashed changes
</script>
