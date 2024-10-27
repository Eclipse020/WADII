<template>
  <div v-if="show" class="day-plan-popup">
    <div class="popup-content">
      <div class="popup-header">
        <h2>{{ selectedDay }}</h2>
        <button class="close-button" @click="$emit('close')">&times;</button>
      </div>

      <div class="control-buttons">
        <button class="clear-day-button" @click="$emit('clear-day')" v-if="hasMeals">
          Clear Day
        </button>
      </div>

      <div class="meal-sections">
        <!-- Breakfast Section -->
        <div class="meal-section">
          <div class="meal-header">
            <h3>Breakfast</h3>
            <button class="add-recipe-button" @click="$emit('add-recipe', 'breakfast')">
              Add Recipe
            </button>
          </div>
          <div class="meal-items">
            <div v-for="(meal, index) in breakfastMeals" :key="index" class="meal-item" @click="$emit('show-recipe-details', meal, index)">
              <span>{{ meal.label }}</span>
              <button class="delete-meal" @click.stop="$emit('delete-recipe', meal, index)">×</button>
            </div>
          </div>
        </div>

        <!-- Lunch Section -->
        <div class="meal-section">
          <div class="meal-header">
            <h3>Lunch</h3>
            <button class="add-recipe-button" @click="$emit('add-recipe', 'lunch')">
              Add Recipe
            </button>
          </div>
          <div class="meal-items">
            <div v-for="(meal, index) in lunchMeals" :key="index" class="meal-item" @click="$emit('show-recipe-details', meal, index)">
              <span>{{ meal.label }}</span>
              <button class="delete-meal" @click.stop="$emit('delete-recipe', meal, index)">×</button>
            </div>
          </div>
        </div>

        <!-- Dinner Section -->
        <div class="meal-section">
          <div class="meal-header">
            <h3>Dinner</h3>
            <button class="add-recipe-button" @click="$emit('add-recipe', 'dinner')">
              Add Recipe
            </button>
          </div>
          <div class="meal-items">
            <div v-for="(meal, index) in dinnerMeals" :key="index" class="meal-item" @click="$emit('show-recipe-details', meal, index)">
              <span>{{ meal.label }}</span>
              <button class="delete-meal" @click.stop="$emit('delete-recipe', meal, index)">×</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DayPlanPopup',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    selectedDay: {
      type: String,
      required: true
    },
    meals: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    breakfastMeals() {
      return this.meals.filter(meal => meal.mealType === 'breakfast');
    },
    lunchMeals() {
      return this.meals.filter(meal => meal.mealType === 'lunch');
    },
    dinnerMeals() {
      return this.meals.filter(meal => meal.mealType === 'dinner');
    },
    hasMeals() {
      return this.meals.length > 0;
    }
  }
};
</script>