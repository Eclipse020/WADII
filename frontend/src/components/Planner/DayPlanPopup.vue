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
            <div v-for="(meal, index) in breakfastMeals" :key="index" class="meal-item">
              <span>{{ meal.label }}</span>
              <button class="delete-meal" @click="$emit('delete-recipe', meal, index)">×</button>
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
            <div v-for="(meal, index) in lunchMeals" :key="index" class="meal-item">
              <span>{{ meal.label }}</span>
              <button class="delete-meal" @click="$emit('delete-recipe', meal, index)">×</button>
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
            <div v-for="(meal, index) in dinnerMeals" :key="index" class="meal-item">
              <span>{{ meal.label }}</span>
              <button class="delete-meal" @click="$emit('delete-recipe', meal, index)">×</button>
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

<style scoped>
.day-plan-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0 8px;
}

.control-buttons {
  margin-bottom: 20px;
}

.meal-section {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.meal-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meal-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.add-recipe-button {
  padding: 6px 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.clear-day-button {
  padding: 6px 12px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-meal {
  background: none;
  border: none;
  color: #f44336;
  cursor: pointer;
  font-size: 18px;
  padding: 0 4px;
}

button:hover {
  opacity: 0.8;
}
</style>
