<template>
  <div id="appFridge">
    <div class="container-fluid">
      <div class="content">
        <header class="my-3 d-flex justify-content-end align-items-end">
          <div>
            <button class="btn btn-success btn-sm me-2" @click="sortByCategory" :disabled="openAddCard">Category &#8597;</button>
            <button class="btn btn-success btn-sm me-2" @click="navigateTo('summary')" :disabled="openAddCard">View Inventory Summary</button>
            <!--Add Product + Edit Product Card-->
            <button v-if="!openAddCard && !isEditing" @click="openAddCard = true" class="btn btn-success btn-sm addButton">
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
              <button class="btn btn-sm me-2 btn2" @click="sortCategorizedItems(category, 'quantity')" :disabled="openAddCard">Quantity
                &#8595;</button>
              <button class="btn btn-sm btn2" @click="sortCategorizedItems(category, 'expiryDate')" :disabled="openAddCard">Expiry Date
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
                    <button class="btn btn-secondary btn-sm mb-1 cardBtn" @click="editItem(item)" :disabled="openAddCard">Edit</button>
                    <button class="btn btn-danger btn-sm cardBtn" @click="deleteItem(item.id)" :disabled="openAddCard">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!--Add Product + Edit Product Card-->
        <!-- <button v-if="!openAddCard && !isEditing" @click="openAddCard = true" class="btn btn-success addButton">
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
        </div> -->
   
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
import '../styles/components/fridge/fridge.css';


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
      try {
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
      } catch (error) {
        console.error("Error deleting item: ", error);
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
