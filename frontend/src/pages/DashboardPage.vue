<template>
    <div class="dashboard-page">
        <DashboardSummary />
    </div>
</template>

<script>
import { defineComponent } from 'vue'
import DashboardSummary  from '../components/Fridge/DashboardSummary.vue';

export default defineComponent({
    name: 'DashboardPage',
    components: {
        DashboardSummary
    }
})
</script>
