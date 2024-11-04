<template>
  <div class="recipe-detail-page">
    <RecipeDeComponent :recipeId="$route.params.id" />
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import RecipeDeComponent from '@/components/Community/RecipeDeComponent.vue'; // Adjust the path if necessary

export default defineComponent({
  name: 'RecipeDetailPage',
  components: {
    RecipeDeComponent,
  },
});
</script>

<style scoped>
/* Add any page-specific styles here */
</style>
