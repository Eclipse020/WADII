<template>

  <div class="container-fluid">
    <div class="content">
      <header class="my-3 d-flex justify-content-end align-items-end">
        <div>
          <button class="btn btn-success btn-sm me-2" @click="sortByCategory">Category &#8597;</button>
          <button class="btn btn-success btn-sm me-2" @click="navigateTo('summary')">View Inventory Summary</button>
          <button class="btn btn-success btn-sm" @click="navigateTo('customize')">Customize</button>
        </div>
      </header>

      <p v-if="!items || items.length === 0">
        Your Fridge is Empty ~&#127810;<br>
        <img class="img-fluid" style="width: 300px" src="../assets/emptyFridge.jpg" alt="Empty Fridge">
      </p>

      <!--Categorized Items-->
      <div v-for="(itemsInCategory, category) in finalItems" :key="category" class="col-12">
        <hr />
        <div class="category-container">
          <h5 class="m-0">{{ category }}</h5>
          <div id="sortButton">
            <button class="btn btn-sm me-2 btn2" @click="sortCategorizedItems(category, 'quantity')">Quantity
              &#8595;</button>
            <button class="btn btn-sm btn2" @click="sortCategorizedItems(category, 'expiryDate')">Expiry Date
              &#8595;</button>
          </div>
        </div>

        <hr />
        <div class="row">
          <div v-for="item in itemsInCategory" :key="item.id" class="col-sm-6 col-md-4 col-lg-3">
            <div class="card mb-4 mx-4 filterCard" :class="{ 'expiring-soon': item.isExpiringSoon }">
              <div class="card-body">
                <h6 class="card-title">{{ item.name }}</h6>
                <div class="card-info">
                  <p class="card-text">Expiry Date: {{ item.expiryDate }}</p>
                  <p class="card-text mb-0">Quantity: {{ item.quantity }}</p>
                </div>
                <div class="mt-auto d-flex flex-column">
                  <button class="btn btn-secondary btn-sm mb-1 cardBtn" @click="editItem(item)">Edit</button>
                  <button class="btn btn-danger btn-sm cardBtn" @click="deleteItem(item.id)">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!--Add Product + Edit Product Card-->
      <button v-if="!openAddCard && !isEditing" @click="openAddCard = true" class="btn btn-success addButton">
        Add Product
      </button>

      <div v-else class="card addCard" style="width: 30rem;">
        <div class="card-body">
          <div class="cardTitle">
            <h5 class="card-title">{{ isEditing ? 'Edit Product' : 'Add Product' }} &#129365;&#127815;&#127838;&#129367;
            </h5>
            <button @click="closeAddCard" class="btn btn-light btnClose">X</button>
          </div>
          <hr />
          <p v-if="validationError" class="errorMessage">{{ validationError }}</p>
          <form @submit.prevent="isEditing ? saveEdit() : addItem()">
            <div class="mb-3">
              <label class="form-label" for="itemName">Name</label>
              <input v-model="itemName" class="form-control" type="text" id="itemName" placeholder="Insert Name"
                required />
            </div>
            <div class="mb-3">
              <label class="form-label" for="category">Category</label>
              <select v-model="itemCategory" class="form-select" id="category" required>
                <option disabled value="" selected>Please Select</option>
                <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label" for="quantity">Quantity</label>
              <input v-model="itemQuantity" class="form-control" type="number" id="quantity" min="1" placeholder="1"
                required />
            </div>
            <div class="mb-3">
              <label class="form-label" for="expiryDate">Expiry Date</label>
              <input v-model="itemExpiryDate" class="form-control" type="date" id="expiryDate" required />
            </div>
            <button type="submit" class="btn btn-success" id="btnAdd">{{ isEditing ? 'Save' : 'Add!' }}</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db, auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, getDoc, addDoc, deleteDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 
import 'bootstrap/dist/css/bootstrap.min.css';

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
    };
  },
  methods: {

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
      const itemData = await getDoc(itemRef); 
  
      if (itemData.exists()) {
          await setDoc(doc(db, `users/${this.currentUserId}/deletedItems`, itemId), {
              name: itemData.data().name,
              category: itemData.data().category,
              deletedAt: new Date().toISOString() 
          });
          await deleteDoc(itemRef);
          console.log("Item deleted and logged to deletedItems.");
          this.items = this.items.filter(item => item.id !== itemId);
      } else {
          console.error("Item not found: ", itemId);
      }
    },

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

    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.currentUserId = user.uid;
        this.getCurrentUserItems(); 
      } else {
        console.log("No user is signed in.");
      }
    });
  },
};
</script>

<style scoped>
/* Content */
template {
  margin: 10px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

header p {
  white-space: nowrap;
  margin: 0;
  /* No margin for a cleaner look */
}

header div {
  /* Add styles for the button container */
  display: flex;
  /* Use flexbox for button alignment */
}

header button {
  white-space: nowrap;
  margin: 0;
  /* No margin for buttons */
  margin-left: 10px;
  /* Margin to space buttons apart */
}

header button:first-child {
  margin-left: 0;
  /* No left margin on the first button */
}

/*Cards: Start*/
.filterCard {
  width: 80%;
  /* Adjust this percentage as needed */
  max-width: 220px;
  /* Maximum width to keep them small */
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background-color: #ffffff;
  transition: transform 0.3s;
}

.filterCard:hover {
  transform: translateY(-4px);
}

.expiring-soon {
  border: 2px solid red;
}

.card-body {
  display: flex;
  flex-direction: column;
  font-size: 18px;
  padding: 15px;
  flex-grow: 1;
  color: #333;
}

.card-info {
  flex-grow: 1;
  margin-bottom: 10px;
}

.card-text {
  margin: 0;
  font-size: 16px;
  color: #555;
}

.expiry-date {
  font-weight: bold;
}

.quantity {
  font-weight: bold;
}

.cardBtn {
  max-width: 190px;
}


.card {
  min-height: 150px;
}

/*Cards: End*/

/*Add Button*/

.addButton {
  position: fixed;
  bottom: 90px;
  right: 10px;
}

/*Form*/

.cardTitle {
  display: flex;
  justify-content: space-between;
}

#btnClose {
  font-weight: bold;
}

h5 {
  padding-top: 15px;
}

.addCard {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30rem;
  background: linear-gradient(135deg, #f9f9f9, #ffffff);
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.15);
  border: 1px solid #e0e0e0;
  padding: 30px;
  z-index: 1000;
  border-radius: 15px;
  font-family: 'Roboto', sans-serif;
}

.addCard, .card-body {
  text-align: left; /* Ensure text alignment is left */
}

.btnClose {
  background-color: #f5f5f5;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

#btnClose:hover {
  background-color: #ddd;
}

#btnAdd {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

#btnAdd:hover {
  background-color: #45a049;
}

.errorMessage {
  color: red;
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 14px;
  text-align: center;
}

/*Sort btn*/
.category-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
}

#sortButton {
  display: flex;
}

.btn2 {
  margin-left: 10px;
}
</style>
