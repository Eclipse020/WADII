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
import '../../styles/components/community/commentpopup.css';

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

