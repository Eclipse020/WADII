<template>
  <div class="popup-overlay" @click="$emit('close')">
    <div class="comment-popup" @click.stop>
      <div class="comments-list">
        <ul>
          <li v-for="(comment, index) in comments" :key="index">
            <strong>{{ comment.username }}:</strong> {{ comment.text }}
          </li>
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
import { auth, db } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default {
  data() {
    return {
      user: null,
    };
  },
  props: {
    comments: {
      type: Array,
      required: true,
      default: () => [],
    },
    modelValue: String,
  },
  async created() {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          this.user = userSnap.data();
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching user data:', error.message);
        this.$router.push('/login');
      }
    } else {
      this.$router.push('/login');
    }
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
        // Emit both the username and the comment text
        this.$emit('add-comment', { 
          username: this.user?.displayName || 'Anonymous', 
          text: this.localNewComment 
        });
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
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.comment-popup {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.comments-list ul {
  list-style-type: none; /* Removes the bullet points */
  padding-left: 0; /* Removes default padding */
  margin: 0;
}

.comments-list li {
  text-align: left;
  margin-bottom: 8px;
  padding-left: 5px;
}

.comments-list strong {
  margin-right: 5px; /* Adds space between the username and the comment text */
}
</style>
