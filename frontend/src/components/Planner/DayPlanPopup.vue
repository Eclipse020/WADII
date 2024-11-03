<template>
  <div v-if="show" class="day-plan-popup">
    <div class="day-plan-popup__content">
      <div class="day-plan-popup__header">
        <h2>{{ selectedDay }}</h2>
        <button class="day-plan-popup__close-button" @click="$emit('close')">&times;</button>
      </div>

      <div class="day-plan-popup__control-buttons">
        <button 
          class="day-plan-popup__clear-day-button" 
          @click="$emit('clear-day')" 
          v-if="hasMeals"
        >
          Clear Day
        </button>
      </div>

      <div class="day-plan-popup__meal-sections">
        <div class="day-plan-popup__meal-section">
          <div class="day-plan-popup__meal-header">
            <select 
              v-model="selectedMealType" 
              class="day-plan-popup__meal-type-dropdown"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="brunch">Brunch</option>
              <option value="snack">Snack</option>
              <option value="tea-time">Tea Time</option>
            </select>
            <button 
              class="day-plan-popup__add-recipe-button" 
              @click="$emit('add-recipe', selectedMealType)"
            >
              Add Recipe
            </button>
          </div>
        </div>

        <div class="day-plan-popup__all-recipes-section">
          <h3 class="day-plan-popup__all-recipes-title">Recipes for the Day</h3>
          <div 
            v-for="(mealTypeGroup, mealType) in groupedMeals" 
            :key="mealType" 
            class="day-plan-popup__meal-type-group"
          >
            <div class="day-plan-popup__meal-type-header">
              <h4>{{ formatMealType(mealType) }}</h4>
            </div>
            <div class="day-plan-popup__meal-type-items">
              <div 
                v-for="(meal, index) in mealTypeGroup" 
                :key="index" 
                class="day-plan-popup__meal-item"
                @click="$emit('show-recipe-details', meal, index)"
              >
                <span>{{ meal.label }}</span>
                <button 
                  class="day-plan-popup__delete-meal-button" 
                  @click.stop="$emit('delete-recipe', meal, index)"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
          <p v-if="meals.length === 0" class="day-plan-popup__no-recipes-message">
            No recipes added for today
          </p>
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
  data() {
    return {
      selectedMealType: 'breakfast'
    }
  },
  computed: {
    groupedMeals() {
      return this.meals.reduce((acc, meal) => {
        if (!acc[meal.mealType]) {
          acc[meal.mealType] = [];
        }
        acc[meal.mealType].push(meal);
        return acc;
      }, {});
    },
    hasMeals() {
      return this.meals.length > 0;
    }
  },
  methods: {
    formatMealType(mealType) {
      return mealType
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  }
};
</script>