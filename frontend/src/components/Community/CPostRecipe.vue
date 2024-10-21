<template>
  <div class="post-recipe">
    <h2>{{ isEditing ? 'Edit Recipe' : 'Post New Recipe' }}</h2>
    <input v-model="recipe.name" placeholder="Name of Recipe" />
    <input v-model="recipe.estimatedTime" placeholder="Estimated Time (mins)" type="number" />
    <input v-model="recipe.calories" placeholder="Calories" type="number" />
    <textarea v-model="recipe.description" placeholder="Description"></textarea>
    <textarea v-model="recipe.ingredients" placeholder="Ingredients (comma-separated)"></textarea>
    <textarea v-model="recipe.steps" placeholder="Cooking Steps"></textarea>
    <button @click="saveToDrafts">{{ isEditing ? 'Update Draft' : 'Save to Drafts' }}</button>
    <button @click="postRecipe">{{ isEditing ? 'Update' : 'Post' }}</button>
  </div>
</template>

<script>
import { createRecipe, saveDraft, getRecipeById } from './CRecipeService';

export default {
  data() {
    return {
      recipe: {
        name: '',
        estimatedTime: '',
        calories: '',
        description: '',
        ingredients: '',
        steps: '',
      },
      isEditing: false,
    };
  },
  methods: {
    async fetchDraft(id) {
      const response = await getRecipeById(id);
      this.recipe = response;
      this.isEditing = true;
    },
    async saveToDrafts() {
      if (this.isEditing) {
        await saveDraft(this.recipe);
        this.$router.push('/community/drafts');
      } else {
        await saveDraft(this.recipe);
        this.$router.push('/community/drafts');
      }
    },
    async postRecipe() {
      await createRecipe(this.recipe);
      this.$router.push('/community');
    },
  },
  mounted() {
    const draftId = this.$route.params.id;
    if (draftId) {
      this.fetchDraft(draftId);
    }
  },
};
</script>

<style scoped>
/* Add your styles here */
</style>
