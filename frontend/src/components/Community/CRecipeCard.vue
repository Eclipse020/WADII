<template>
  <div class="recipe-card">
  <div class="recipe-image-wrapper">
    <img :src="recipe.image" alt="Recipe Image" class="recipe-image" v-if="recipe.image" />
  </div>
    <h3>{{ recipe.name }}</h3>
    <p>By: {{ recipe.username }}</p>
    <div class="interaction-icons">
      <span>{{ recipe.likes }} ❤️</span>
      <span>{{ recipe.saves }} ⭐</span>
      <span>{{ recipe.shares }} 🔄</span>
    </div>
    <div class="like-section">
      <button @click.stop="toggleLike(postId)">
        <i :class="isLiked ? 'heart-icon liked' : 'heart-icon'"></i>
        {{ likesCount }} likes
      </button>
    </div>

    <button @click="toggleComments" class="comment-button">
      Comment
    </button>

    <div v-if="showComments" class="comment-panel">
      <div class="comments">
        <div v-for="comment in comments" :key="comment.id" class="comment">
          <p><strong>{{ comment.user }}</strong>: {{ comment.text }}</p>
        </div>
      </div>
      <input v-model="newComment" @keyup.enter="addComment" placeholder="Add a comment..." />
    </div>
  </div>
</template>

<script>
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { getRecipeById } from './CRecipeService'; // Update path as needed
import { db } from '../../services/firebase'; // Update path as needed
export default {
  props: {
    recipe: Object,
  },
    data() {
    return {
      isLiked: false,
      likesCount: 0,
      showComments: false,
      newComment: '',
      comments: []
    };
  },
  methods: {
    async toggleLike() {
      this.isLiked = !this.isLiked;
      this.likesCount += this.isLiked ? 1 : -1;

      try {
        const recipeRef = doc(db, 'recipes', this.recipe.id);
        await updateDoc(recipeRef, {
          likes: this.likesCount
        });
      } catch (error) {
        console.error('Error updating likes:', error);
        this.isLiked = !this.isLiked;
        this.likesCount += this.isLiked ? 1 : -1;
      }
    },
    toggleComments() {
      this.showComments = !this.showComments;
    },
    async addComment() {
      if (this.newComment.trim()) {
        const newCommentObj = {
          text: this.newComment,
          user: 'Current User', // Replace with actual user logic
          createdAt: new Date()
        };
        
        this.comments.push(newCommentObj);

        try {
          const recipeRef = doc(db, 'recipes', this.recipe.id);
          await updateDoc(recipeRef, {
            comments: arrayUnion(newCommentObj)
          });
        } catch (error) {
          console.error('Error adding comment:', error);
        }

        this.newComment = '';
      }
    }
  },
  async mounted() {
    try {
      const recipeData = await getRecipeById(this.recipe.id);
      this.likesCount = recipeData.likes || 0;
      this.comments = recipeData.comments || [];
    } catch (error) {
      console.error('Error fetching recipe data:', error);
    }
  }
};
</script>

<style scoped>
.recipe-image-wrapper {
  width: 100%;
  height: 200px; /* Adjust this to your desired height */
  overflow: hidden;
  border-radius: 8px; /* Optional: Rounds the corners of the image */
}

.recipe-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Ensures the image covers the container while maintaining its aspect ratio */
  object-position: center; /* Focuses on the center of the image */
}
.recipe-card {
  border: 1px solid #ccc;
  padding: 16px;
  margin: 8px;
  text-align: center;
}
.like-section {
  display: flex;
  align-items: center;
  gap: 5px;
}

.heart-icon {
  font-size: 24px;
  color: white;
  transition: color 0.3s;
  cursor: pointer;
}

.heart-icon.liked {
  color: green;
}

.comment-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: white;
  padding: 16px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;
  transform: translateY(100%);
}

.comment-panel.show {
  transform: translateY(0);
}

.comments {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 8px;
}

.comment {
  padding: 4px 0;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>

