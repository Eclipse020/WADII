<template>
  <div class="meal-planner-page">
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