<template>
  <div class="popup-overlay" @click="$emit('close')"> <!-- Overlay to close the popup on background click -->
    <div class="comment-popup" @click.stop>
      <div class="comments-list">
        <ul>
          <li v-for="(comment, index) in comments" :key="index">{{ comment }}</li>
        </ul>
      </div>
      <input 
        v-model="localNewComment" 
        placeholder="Add a comment..." 
        @keypress.enter="submitComment"
      />
      <button @click="submitComment">Post Comment</button>
      <button @click="$emit('close')">Close</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    comments: Array,
    modelValue: String,
  },
  computed: {
    localNewComment: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    }
  },
  methods: {
    submitComment() {
      if (this.localNewComment.trim()) {
        this.$emit('add-comment', this.localNewComment);
        this.localNewComment = '';
      }
    }
  }
}
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7); /* Semi-transparent background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Ensure it's above other content */
}

.comment-popup {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>
