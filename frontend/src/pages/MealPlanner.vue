<template>
  <div class="meal-planner-page">
    <div class="header">
      <h1>Plan Your Meals</h1>
      <p>Organize your weekly meals, manage recipes, and keep track of your shopping list - all in one place!</p>
    </div>
    <MealPlannerComponent />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import MealPlannerComponent from '../components/Planner/MealPlannerComponent.vue'

export default defineComponent({
  name: 'MealPlannerPage',
  components: {
    MealPlannerComponent
  }
})
</script>
