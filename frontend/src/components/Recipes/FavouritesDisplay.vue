<template>
    <h1>Recipe added Successfully</h1>
    <div v-if="this.recipe && this.recipe.label" class="recipe-container">
      <h2 class="recipe-title">{{ this.recipe.label }}</h2>
      <p class="recipe-time">Ready in <strong>{{ this.recipe.totalTime }} minutes</strong></p>
  
      <h3>Ingredients</h3>
      <ul class="ingredient-list">
        <li v-for="(ingredient, index) in this.recipe.ingredientLines" :key="index" class="ingredient-item">
          <span :class="{ highlight: this.fridgeItems.includes(ingredient) }">{{ ingredient }}</span>
        </li>
      </ul>
    </div>
</template>