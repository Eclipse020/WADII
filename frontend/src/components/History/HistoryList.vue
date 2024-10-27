<script>
import HistoryCard from "./HistoryCard.vue";

export default {
  props: {
    history: {
      type: Array,
      required: true,
    },
  },
};
</script>

<template>
  <div>
    <ul>
      <li v-for="entry in history" :key="entry.id">
        <HistoryCard :entry="entry" />
      </li>
    </ul>
  </div>
</template>

<style scoped>
ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 16px; /* Space between each card */
}
</style>
