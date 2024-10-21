<template>
    <div class="meal-plan">
      <h1>Weekly Meal Planner</h1>
  
      <div class="search-section">
        <input
          v-model="newRecipeName"
          placeholder="What do you want to eat?"
          @keyup.enter="addRecipeToDay"
        />
        <select v-model="selectedDay">
          <option v-for="(day, index) in mealPlan.days" :key="index" :value="index">
            {{ day.name }}
          </option>
        </select>
        <button class="add-button" @click="addRecipeToDay">Add Recipe</button>
      </div>
  
      <table class="meal-plan-table">
        <thead>
          <tr>
            <th v-for="(day, index) in mealPlan.days" :key="index">{{ day.name }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              v-for="(day, index) in mealPlan.days"
              :key="index"
              @dragover.prevent
              @drop="dropRecipe($event, index)"
              class="meal-day"
            >
              <ul class="recipe-list">
                <li
                  v-for="(recipe, recipeIndex) in day.recipes"
                  :key="recipeIndex"
                  draggable
                  @dragstart="dragRecipe($event, recipe)"
                  class="recipe-slot"
                >
                  <span>{{ recipe.name }}</span>
                  <button class="remove-button" @click="removeRecipe(day, recipe)">Remove</button>
                </li>
              </ul>
              <button class="suggest-button" @click="suggestRecipes(day)">Suggest Recipes</button>
            </td>
          </tr>
        </tbody>
      </table>
  
      <h2>Shopping List</h2>
      <ul>
        <li v-for="(item, index) in shoppingList" :key="index">
          {{ item }}
          <button class="remove-button" @click="removeItemFromShoppingList(item)">Remove</button>
        </li>
      </ul>
  
      <input v-model="newShoppingItem" placeholder="Add item to shopping list" />
      <button class="add-button" @click="addItemToShoppingList">Add to Shopping List</button>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        mealPlan: {
          days: [
            { name: 'Monday', recipes: [] },
            { name: 'Tuesday', recipes: [] },
            { name: 'Wednesday', recipes: [] },
            { name: 'Thursday', recipes: [] },
            { name: 'Friday', recipes: [] },
            { name: 'Saturday', recipes: [] },
            { name: 'Sunday', recipes: [] },
          ],
        },
        shoppingList: [],
        newShoppingItem: '',
        newRecipeName: '', // New data property for the recipe name input
        selectedDay: 0,    // New data property for the selected day index
        draggedRecipe: null,
      };
    },
    methods: {
      async fetchMealPlan() {
        try {
          const response = await axios.get('/api/mealplan');
          this.mealPlan = response.data;
        } catch (error) {
          console.error('Error fetching meal plan:', error);
        }
      },
      async fetchShoppingList() {
        try {
          const response = await axios.get('/api/shoppinglist');
          this.shoppingList = response.data;
        } catch (error) {
          console.error('Error fetching shopping list:', error);
        }
      },
      async addItemToShoppingList() {
        if (this.newShoppingItem.trim()) {
          try {
            await axios.post('/api/shoppinglist', { item: this.newShoppingItem });
            this.fetchShoppingList(); // Refresh the shopping list after adding
            this.newShoppingItem = ''; // Clear input
          } catch (error) {
            console.error('Error adding item to shopping list:', error);
          }
        }
      },
      async removeItemFromShoppingList(item) {
        try {
          await axios.delete(`/api/shoppinglist/${item}`); // Ensure your backend handles item deletion
          this.fetchShoppingList(); // Refresh the shopping list after removal
        } catch (error) {
          console.error('Error removing item from shopping list:', error);
        }
      },
      dragRecipe(event, recipe) {
        this.draggedRecipe = recipe;
      },
      dropRecipe(event, dayIndex) {
        if (this.draggedRecipe) {
          this.mealPlan.days[dayIndex].recipes.push(this.draggedRecipe);
          this.draggedRecipe = null; // Reset the dragged recipe
        }
      },
      removeRecipe(day, recipe) {
        const index = day.recipes.indexOf(recipe);
        if (index > -1) {
          day.recipes.splice(index, 1);
        }
      },
      async suggestRecipes(day) {
        // Placeholder for recipe suggestion logic
        const suggestedRecipes = [
          { name: 'Spaghetti Bolognese' },
          { name: 'Chicken Salad' },
          { name: 'Beef Stir-fry' },
        ];
        day.recipes.push(...suggestedRecipes);
      },
      addRecipeToDay() {
        if (this.newRecipeName.trim()) {
          const dayIndex = this.selectedDay;
          this.mealPlan.days[dayIndex].recipes.push({ name: this.newRecipeName });
          this.newRecipeName = ''; // Clear input after adding
        }
      },
    },
    mounted() {
      this.fetchMealPlan();
      this.fetchShoppingList();
    },
  };
  </script>
  
  <style scoped>
  .meal-plan {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .search-section {
    margin-bottom: 20px;
  }
  
  .search-section input {
    padding: 10px;
    margin-right: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  .search-section select {
    padding: 10px;
    margin-right: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  .meal-plan-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .meal-plan-table th {
    background-color: #42b983;
    color: white;
    font-size: 1.2em; /* Increase header font size */
  }
  
  .meal-plan-table th,
  .meal-plan-table td {
    border: 1px solid #42b983;
    padding: 10px;
    text-align: center;
    width: 14.2857%; /* 100% / 7 days = 14.2857% per column */
  }
  
  .meal-plan-table td {
    font-size: 0.9em; /* Decrease table content font size */
  }
  
  .meal-day {
    position: relative;
  }
  
  .recipe-list {
    list-style-type: none; /* Remove bullet points */
    padding: 0;           /* Remove padding */
    margin: 0;            /* Remove margin */
  }
  
  .recipe-slot {
    padding: 5px;
    background-color: #f9f9f9;
    margin: 5px 0;
    position: relative;
    display: flex; /* Use flex to align items */
    justify-content: space-between; /* Space between name and button */
    align-items: center; /* Center vertically */
  }
  
  .remove-button,
  .add-button,
  .suggest-button {
    font-size: 0.8em; /* Smaller font size for buttons */
    padding: 5px 10px; /* Reduced padding for buttons */
    border: none; /* Remove default border */
    border-radius: 5px; /* Rounded corners */
    cursor: pointer; /* Pointer cursor on hover */
    transition: background-color 0.3s ease; /* Smooth background color change */
  }
  
  .remove-button {
    background-color: #ff6347; /* Red for remove buttons */
    color: black; /* White text */
  }
  
  .add-button {
    background-color: #f7e7a9; /* Light yellow color */
    color: black; /* Dark text color for contrast */
  }
  
  .suggest-button {
    background-color: #f0d58f; /* Green color for suggest button */
    color: black; /* White text for contrast */
  }
  
  .remove-button:hover {
    background-color: #ff2e2e; /* Darker red on hover */
  }
  
  .add-button:hover {
    background-color: #f0d58f; /* Darker yellow on hover */
  }
  
  .suggest-button:hover {
    background-color: #36a771; /* Darker green on hover */
  }
  
  h2 {
    margin-top: 0;
  }
  </style>
  