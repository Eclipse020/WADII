<template>
    <div class="meal-plan">
      <h1>Weekly Meal Planner</h1>
  
      <div class="meal-plan-container">
        <div class="meal-plan-days">
          <div
            class="meal-day"
            v-for="(day, index) in mealPlan.days"
            :key="index"
            @dragover.prevent
            @drop="dropRecipe($event, index)"
          >
            <h2>{{ day.name }}</h2>
            <div
              class="recipe-slot"
              v-for="(recipe, recipeIndex) in day.recipes"
              :key="recipeIndex"
              draggable
              @dragstart="dragRecipe($event, recipe)"
            >
              {{ recipe.name }}
              <button @click="removeRecipe(day, recipe)">Remove</button>
            </div>
            <button @click="suggestRecipes(day)">Suggest Recipes</button>
          </div>
        </div>
      </div>
  
      <h2>Shopping List</h2>
      <ul>
        <li v-for="(item, index) in shoppingList" :key="index">
          {{ item }}
          <button @click="removeItemFromShoppingList(item)">Remove</button>
        </li>
      </ul>
  
      <input v-model="newShoppingItem" placeholder="Add item to shopping list" />
      <button @click="addItemToShoppingList">Add to Shopping List</button>
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
          await axios.delete(`/api/shoppinglist/${item}`); // Update your backend to handle item deletion
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
        // Implement your recipe suggestion logic based on user's preferences
        // This is a placeholder for now
        const suggestedRecipes = [
          { name: 'Spaghetti Bolognese' },
          { name: 'Chicken Salad' },
          { name: 'Beef Stir-fry' },
        ];
        day.recipes.push(...suggestedRecipes);
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
  
  .meal-plan-container {
    display: flex;
    justify-content: space-between;
  }
  
  .meal-day {
    flex: 1;
    margin: 0 10px;
    border: 1px solid #ccc;
    padding: 10px;
  }
  
  .recipe-slot {
    border: 1px dashed #aaa;
    padding: 5px;
    margin: 5px 0;
    background-color: #f9f9f9;
  }
  
  .recipe-slot button {
    margin-left: 10px;
  }
  
  h2 {
    margin-top: 0;
  }
  </style>
  