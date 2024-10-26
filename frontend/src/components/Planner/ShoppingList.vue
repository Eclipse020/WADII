<template>
    <div class="shopping-list">
      <h4>Shopping List</h4>
  
      <!-- Input group stays at the top -->
      <div class="input-group mb-3">
        <input 
          v-model="newIngredient" 
          placeholder="Add an ingredient" 
          class="form-control"
          @keyup.enter="addIngredient"
        />
        <button class="btn btn-primary" @click="addIngredient">Add</button>
      </div>
  
      <!-- List of ingredients -->
      <ul class="ingredient-list">
        <li v-for="(item, index) in localIngredients" :key="index" class="list-item">
          {{ item }}
          <button class="btn btn-danger btn-sm" @click="removeIngredient(index)">Remove</button>
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ShoppingList',
    props: {
      ingredients: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        localIngredients: [],
        newIngredient: ''
      };
    },
    watch: {
      ingredients: {
        immediate: true,
        deep: true,
        handler(newVal) {
          // Only update if the arrays are different
          if (JSON.stringify(this.localIngredients) !== JSON.stringify(newVal)) {
            this.localIngredients = [...newVal];
          }
        }
      }
    },
    methods: {
      addIngredient() {
        if (this.newIngredient.trim()) {
          const ingredient = this.newIngredient.trim();
          if (!this.localIngredients.includes(ingredient)) {
            this.localIngredients.push(ingredient);
            this.newIngredient = '';
            this.$emit('update', [...this.localIngredients]);
          }
        }
      },
      removeIngredient(index) {
        this.localIngredients.splice(index, 1);
        this.$emit('update', [...this.localIngredients]);
      }
    }
  };
  </script>
  
  <style scoped>
  .shopping-list {
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .ingredient-list {
    list-style: none;
    padding: 0;
    margin-top: 1rem;
  }
  
  .list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  .btn-danger {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }
  </style>