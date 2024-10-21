<template>
  <div class="container-fluid">
    <div class="content">
      <header class="d-flex justify-content-between align-items-center">
        <p class="m-0">My Fridge</p>
        <div>
          <button class="btn btn-primary me-2" @click="sortByCategory">Category &#8597;</button>
          <button class="btn btn-primary me-2" @click="navigateTo('summary.html')">View Inventory Summary</button>
          <button class="btn btn-primary" @click="navigateTo('customize.html')">Customize</button>
        </div>
      </header>

      <!--Categorized Items-->
      <div v-for="(itemsInCategory, category) in finalItems" :key="category" class="col-12">
        <hr />
        <div class="category-container">
          <h5 class="m-0">{{ category }}</h5>
          <div id="sortButton">
            <button class="btn btn-sm me-2 btn2" @click="sortCategorizedItems(category, 'quantity')">Quantity &#8595;</button>
            <button class="btn btn-sm btn2" @click="sortCategorizedItems(category, 'expiryDate')">Expiry Date &#8595;</button>
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
                  <button class="btn btn-primary btn-sm cardBtn" @click="deleteItem(item.id)">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!--Add Product + Edit Product Card-->
      <button v-if="!openAddCard && !isEditing" @click="openAddCard = true" class="btn btn-primary addButton">
        Add Product
      </button>

      <div v-else class="card addCard" style="width: 30rem;">
        <div class="card-body">
          <div class="cardTitle">
            <h5 class="card-title">{{ isEditing ? 'Edit Product' : 'Add Product' }} &#129365;&#127815;&#127838;&#129367;</h5>
            <button @click="closeAddCard" class="btn btn-light btnClose">X</button>
          </div>
          <hr />
          <p v-if="validationError" class="errorMessage">{{ validationError }}</p>
          <form @submit.prevent="isEditing ? saveEdit() : addItem()">
            <div class="mb-3">
              <label class="form-label" for="itemName">Name</label>
              <input v-model="itemName" class="form-control" type="text" id="itemName" placeholder="Insert Name" required />
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
              <input v-model="itemQuantity" class="form-control" type="number" id="quantity" min="1" placeholder="1" required />
            </div>
            <div class="mb-3">
              <label class="form-label" for="expiryDate">Expiry Date</label>
              <input v-model="itemExpiryDate" class="form-control" type="date" id="expiryDate" required />
            </div>
            <button type="submit" class="btn btn-primary" id="btnAdd">{{ isEditing ? 'Save' : 'Add!' }}</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db, auth } from '../services/firebase'; // Adjust path as necessary
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";

export default {
  name: 'FridgePage',
  data() {
    return {
      currentUserId: null,
      items: [],
      sortedItems: {},
      sortOrder: "asc",
      openAddCard: false,
      itemName: "",
      itemCategory: "",
      itemQuantity: 1,
      itemExpiryDate: "",
      validationError: "",
      isEditing: false,
      itemToEdit: null,
      categories: [
        "Dairy",
        "Fruits",
        "Vegetables",
        "Meats",
        "Seafood",
        "Grains and Cereals",
        "Nuts and Seeds",
        "Legumes",
        "Beverages",
        "Snacks",
        "Condiments and Sauces",
        "Herbs and Spices",
        "Frozen Foods",
        "Baked Goods",
        "Canned and Jarred Goods",
        "Deli",
        "Prepared Meals",
        "Pantry Staples",
        "Breakfast Foods",
        "Sweets and Desserts",
        "Non-Alcoholic Drinks",
        "Alcoholic Drinks",
        "Others",
      ],
    };
  },
  methods: {
    async getCurrentUserItems() {
      if (this.currentUserId) {
        try {
          const querySnapshot = await getDocs(collection(db, `users/${this.currentUserId}/items`));
          this.items = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            isExpiringSoon: this.isItemExpiringSoon(doc.data().expiryDate)
          }));
        } catch (error) {
          console.error("Error fetching items: ", error);
          alert(error)
        }
      }
    },
    sortByCategory() {
      if (this.sortOrder === "asc") {
        this.items.sort((a, b) => a.category.localeCompare(b.category));
        this.sortOrder = "desc";
      } else {
        this.items.sort((a, b) => b.category.localeCompare(a.category));
        this.sortOrder = "asc";
      }
    },
    sortItems() {
      this.items.sort((item1, item2) => item1.name.localeCompare(item2.name));
    },
    sortCategorizedItems(category, sortBy) {
      const sorted = [...this.items.filter((item) => item.category === category)];
      if (sortBy === "quantity") {
        sorted.sort((a, b) => a.quantity - b.quantity);
      } else if (sortBy === "expiryDate") {
        sorted.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
      }
      this.sortedItems[category] = sorted;
    },
    async addItem() {
      try {
        const expiryDate = new Date(this.itemExpiryDate);
        const today = new Date();
        const daysUntilExpiry = (expiryDate - today) / (1000 * 60 * 60 * 24);
        const isExpiringSoon = daysUntilExpiry <= 3;

        const newItem = {
          name: this.capitalizeFirstLetter(this.itemName),
          category: this.itemCategory,
          quantity: this.itemQuantity,
          expiryDate: this.itemExpiryDate,
          isExpiringSoon,
        };
        const docRef = await addDoc(collection(db, "items"), newItem);
        newItem.id = docRef.id;
        this.items.push(newItem);

        // Reset form
        this.resetForm();
      } catch (error) {
        console.error("Error adding item: ", error);
      }
    },
    async deleteItem(id) {
      try {
        await deleteDoc(doc(db, "items", id));
        this.items = this.items.filter((item) => item.id !== id);
      } catch (error) {
        console.error("Error deleting item: ", error);
      }
    },
    editItem(item) {
      this.isEditing = true;
      this.itemToEdit = item;
      this.itemName = item.name;
      this.itemCategory = item.category;
      this.itemQuantity = item.quantity;
      this.itemExpiryDate = item.expiryDate;
      this.openAddCard = true;
    },
    async saveEdit() {
      try {
        const expiryDate = new Date(this.itemExpiryDate);
        const today = new Date();
        const daysUntilExpiry = (expiryDate - today) / (1000 * 60 * 60 * 24);
        const isExpiringSoon = daysUntilExpiry <= 3;

        const updatedItem = {
          name: this.capitalizeFirstLetter(this.itemName),
          category: this.itemCategory,
          quantity: this.itemQuantity,
          expiryDate: this.itemExpiryDate,
          isExpiringSoon,
        };
        await updateDoc(doc(db, "items", this.itemToEdit.id), updatedItem);
        this.items = this.items.map((item) => (item.id === this.itemToEdit.id ? { ...item, ...updatedItem } : item));

        // Reset form
        this.isEditing = false;
        this.itemToEdit = null;
        this.resetForm();
      } catch (error) {
        console.error("Error editing item: ", error);
      }
    },
    closeAddCard() {
      this.openAddCard = false;
      this.isEditing = false;
      this.resetForm();
    },
    resetForm() {
      this.itemName = "";
      this.itemCategory = "";
      this.itemQuantity = 1;
      this.itemExpiryDate = "";
      this.validationError = "";
      this.openAddCard = false;
    },
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    navigateTo(path) {
      window.location.href = path;
    },
  },
  computed: {
    finalItems() {
      // Grouping items by category for display
      return this.items.reduce((categories, item) => {
        if (!categories[item.category]) {
          categories[item.category] = [];
        }
        categories[item.category].push(item);
        return categories;
      }, {});
    },
  },
  mounted() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.currentUserId = user.uid; // Get the current user's ID
        this.getCurrentUserItems(); // Fetch current user's items
      } else {
        console.log("No user is signed in.");
      }
    });
  },
};
</script>

<style scoped>
/* Content */
  body {
      margin: 10px;
  }

  header {
      display: flex;
      justify-content: space-between; /* Ensures space between items */
      align-items: center;
  }

  header p {
      white-space: nowrap;
      margin: 0; /* No margin for a cleaner look */
  }

  header div { /* Add styles for the button container */
      display: flex; /* Use flexbox for button alignment */
  }

  header button {
      white-space: nowrap;
      margin: 0; /* No margin for buttons */
      margin-left: 10px; /* Margin to space buttons apart */
  }

  header button:first-child {
      margin-left: 0; /* No left margin on the first button */
  }

  /*Cards: Start*/
  .filterCard {
      width: 80%; /* Adjust this percentage as needed */
      max-width: 220px; /* Maximum width to keep them small */
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
      font-size: 18px; /* Adjust font size for better readability */
      padding: 15px; 
      flex-grow: 1; 
      color: #333; 
  }

  .card-info {
      flex-grow: 1; /* Allow this section to take up space */
      margin-bottom: 10px; /* Add some space before buttons */
  }

  .card-text {
      margin: 0; 
      font-size: 16px; 
      color: #555; 
  }

  .expiry-date {
      font-weight: bold; /* Make expiry date bold */
  }

  .quantity {
      font-weight: bold; /* Make quantity bold */
  }

  .cardBtn {
      max-width: 190px; /* Make buttons take the full width */
  }


  .card {
      min-height: 150px; 
  }

  /*Cards: End*/

  /*Add Button*/

  .addButton {
      position: fixed;
      bottom: 20px;
      right: 20px;
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
      display: flex;              /* Use flexbox for layout */
      justify-content: space-between; /* Space items between */
      align-items: center;       /* Center items vertically */
      margin: 10px 0;           /* Add some margin above and below */
  }

  #sortButton {
      display: flex;             /* Ensures buttons are in a row */
  }

  .btn2 {
      margin-left: 10px;        /* Add spacing between buttons */
  }
</style>
