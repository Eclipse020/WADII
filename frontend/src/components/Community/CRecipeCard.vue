<template>
  <div class="recipe-card">
    <img :src="recipe.image" alt="Recipe Image" class="recipe-image" />
    <h3>{{ recipe.name }}</h3>
    <p>By: {{ recipe.username }}</p>
    <div class="interaction-icons">
      <span>{{ recipe.likes }} ❤️</span>
      <span>{{ recipe.saves }} ⭐</span>
      <span>{{ recipe.shares }} 🔄</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    recipe: Object,
  },
};
</script>

<style scoped>
.recipe-card {
  border: 1px solid #ccc;
  padding: 16px;
  margin: 8px;
  text-align: center;
}
.recipe-image {
  width: 100%;
  height: auto;
}
</style>
