// HomePage.vue
<template>
  <div class="home-page-wrapper">
    <HomeContent />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import HomeContent from '../components/Home/HomeContent.vue'

export default defineComponent({
  name: 'HomePage',
  components: {
    HomeContent
  }
})
</script>