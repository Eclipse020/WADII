<template>
    <div class="post-recipe-page">
      <PostRecipeComponent />
    </div>
  </template>
  
  <script>
  import { defineComponent } from 'vue'
  import PostRecipeComponent from '../components/Community/PostRecipeComponent.vue'
  
  export default defineComponent({
    name: 'PostRecipePage',
    components: {
        PostRecipeComponent
    }
  })
  </script>