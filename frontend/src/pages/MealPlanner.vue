<template>
  <div class="home">
    <h1>Welcome to Your Meal Planning App</h1>
    <MealPlanner />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import MealPlanner from '@/components/Planner/MealPlannerComponent.vue'

export default defineComponent({
  name: 'HomePage',
  components: {
    MealPlanner
  }
})
</script>