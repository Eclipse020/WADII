<template>
    <div class="history-page">
    <h2>Your Cooking History</h2>
    <div class="recipe-cards">
      <div v-for="entry in history" :key="entry.id" class="recipe-card">
        <h3>{{ entry.name }}</h3>
        <p>Calories: {{ entry.calories }}</p>
      </div>
    </div>
  </div>
</template>

<style>
.history-button {
  background-color: #76c7c0;
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}
.history-button:hover {
  background-color: #68b2ab;
}
</style>

<script>
import { fetchCookingHistory } from "@/services/historyService";

export default {
  data() {
    return {
      history: [],
    };
  },
  created() {
    this.fetchHistory();
  },
  methods: {
    async fetchHistory() {
      // Fetch the cooking history from your service
      const response = await fetchCookingHistory(this.$store.state.user.id); // Adjust based on your logic
      this.history = response; // Handle the response accordingly
    },
  },
};
</script>

<style>
.history-page {
  padding: 20px;
}
.recipe-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.recipe-card {
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}
</style>
