<template>
  <div class="history-page">
    <HistoryComponent/>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import HistoryComponent from '../components/History/HistoryComponent.vue'

export default defineComponent({
  name: 'HistoryPage',
  components: {
    HistoryComponent
  }
})
</script>
