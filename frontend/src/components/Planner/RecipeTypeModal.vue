<template>
  <div class="recipe-type-modal">
    <h2>Select a Meal Type</h2>
    <div class="meal-types">
      <button @click="selectMeal('Breakfast')">Breakfast</button>
      <button @click="selectMeal('Lunch')">Lunch</button>
      <button @click="selectMeal('Dinner')">Dinner</button>
    </div>
    <div class="selected-meal">
      <p v-if="selectedMeal">Selected Meal: {{ selectedMeal }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    show: Boolean,
    selectedDay: String,
  },
  data() {
    return {
      selectedMeal: '',
    };
  },
  methods: {
    selectMeal(meal) {
      this.selectedMeal = meal;
      this.$emit('meal-selected', { day: this.selectedDay, meal });
    },
  },
};
</script>

<style scoped>
.recipe-type-modal {
  /* Styles for your modal */
}
.meal-types button {
  margin: 5px;
}
</style>
