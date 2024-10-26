<template>
  <div class="drafts">
    <h2>Your Drafts</h2>
    <div v-if="drafts.length === 0">
      <p>No drafts found.</p>
    </div>
    <div class="draft-cards">
      <div v-for="draft in drafts" :key="draft.id" class="draft-card" @click="editDraft(draft.id)">
        <h3>{{ draft.name || 'Untitled Recipe' }}</h3>
        <p>Estimated Time: {{ draft.estimatedTime }} minutes</p>
        <p>Calories: {{ draft.calories }} kcal</p>
        <button @click.stop="deleteDraft(draft.id)">Delete</button>
      </div>
    </div>
  </div>
</template>

<script>
import { getDrafts, deleteDraft } from './CRecipeService';

export default {
  data() {
    return {
      drafts: [],
    };
  },
  methods: {
    async fetchDrafts() {
      this.drafts = await getDrafts();
    },
    editDraft(id) {
      this.$router.push(`/community/post-recipe/${id}`);
    },
    async deleteDraft(id) {
      await deleteDraft(id);
      this.fetchDrafts();
    },
  },
  mounted() {
    this.fetchDrafts();
  },
};
</script>

<style scoped>
.draft-cards {
  display: flex;
  flex-wrap: wrap;
}
.draft-card {
  border: 1px solid #ccc;
  padding: 16px;
  margin: 8px;
  cursor: pointer;
}
</style>
