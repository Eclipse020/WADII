<template>
    <div class="community-page">
      <CRecipeComponent />
    </div>
  </template>
  
  <script>
  import { defineComponent } from 'vue'
  import CRecipeComponent from '../components/Community/CRecipeComponent.vue'
  
  export default defineComponent({
    name: 'CommunityPage',
    components: {
        CRecipeComponent
    }
  })
  </script>
  