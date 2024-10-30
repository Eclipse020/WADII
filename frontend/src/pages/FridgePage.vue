<template>
  <div class="add-item-page">
    <AddItem />
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import AddItem from '../components/Fridge/AddItem.vue';

export default defineComponent({
  name: 'AddItemPage',  
  components: {
    AddItem
  }
});
</script>
