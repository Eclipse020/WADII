<script>
export default {
  props: {
    entry: {
      type: Object,
      required: true,
    },
  },
  computed: {
    formattedDate() {
      // Format the date for better display
      const date = new Date(this.entry.date);
      return date.toLocaleDateString();
    },
  },
};
</script>

<template>
  <div class="history-card">
    <h2>{{ entry.recipeId }}</h2>
    <p>Date Cooked: {{ formattedDate }}</p>
    <p>Calories: {{ entry.calories }} kcal</p>
  </div>
</template>

<style scoped>
.history-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.history-card h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.history-card p {
  margin: 8px 0;
  color: #666;
}
</style>
