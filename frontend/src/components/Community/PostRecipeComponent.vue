<template>
    <div class="post-recipe-container">
      <h2 class="text-center mb-4">{{ isEditing ? 'Edit Recipe' : 'Post New Recipe' }}</h2>
      <div class="post-recipe-form">
      <div class="mb-3">
          <input 
            type="file" 
            @change="onFileChange" 
            class="form-control" 
            accept="image/*" 
          />
          </div>
        <div class="mb-3">
          <input 
            v-model="recipe.name" 
            placeholder="Name of Recipe" 
            class="form-control" 
            required 
          />
        </div>
        <div class="row mb-3">
          <div class="col">
            <input 
              v-model="recipe.estimatedTime" 
              placeholder="Estimated Time (mins)" 
              type="number" 
              class="form-control" 
              required 
            />
          </div>
          <div class="col">
            <input 
              v-model="recipe.calories" 
              placeholder="Calories" 
              type="number" 
              class="form-control" 
              required 
            />
          </div>
        </div>
        <div class="mb-3">
          <textarea 
            v-model="recipe.description" 
            placeholder="Description" 
            class="form-control" 
            rows="3" 
            required 
          ></textarea>
        </div>
        <div class="mb-3">
          <textarea 
            v-model="recipe.ingredients" 
            placeholder="Ingredients (comma-separated)" 
            class="form-control" 
            rows="2"
            @input="handleIngredientInput(recipe.ingredients)"  
            required 
          ></textarea>
        </div>
        <div class="mb-3">
          <textarea 
            v-model="recipe.steps" 
            placeholder="Cooking Steps:
        1. Wash potato
        2. Peel potato etc." 
            class="form-control" 
            rows="6" 
            required 
          ></textarea>
        </div>
        
        <div class="d-flex justify-content-center mt-3">
    <button 
      @click="saveToDrafts" 
      class="btn btn-secondary mx-2 shadow"
    >
      {{ isEditing ? 'Update Draft' : 'Save to Drafts' }}
    </button>
    <button 
      @click="postRecipe" 
      class="btn btn-success mx-2 shadow"
    >
      {{ isEditing ? 'Update' : 'Post' }}
    </button>
  </div>
  
      </div>
    </div>
  </template>