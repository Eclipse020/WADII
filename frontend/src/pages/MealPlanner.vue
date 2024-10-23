<template>
  <div class="home">
    <h1>Plan Your Meals</h1>
    <p>Unsure on what to cook? Don't worry, Josh is here to help!</p>
    <MealPlanner />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import MealPlanner from '@/components/Planner/MealPlannerComponent.vue'

export default defineComponent({
  name: 'MealPlanner',
  components: {
    MealPlanner
  }
})
</script>
