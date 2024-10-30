<template>
    <div class="overview-page">
        <FridgeOverview />
    </div>
</template>

<script>
import { defineComponent } from 'vue'
import FridgeOverview from '../components/Fridge/OverviewLog.vue'

export default defineComponent({
    name: 'OverviewPage',
    components: {
        FridgeOverview
    }
})
</script>
