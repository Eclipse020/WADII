// src/services/communityService.js
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, increment, arrayUnion } from "firebase/firestore";

export const addCommunityRecipe = async (userId, recipe) => {
  try {
    const docRef = await addDoc(collection(db, "communityRecipes"), {
      ...recipe,
      userId,
      createdAt: new Date(),
    });
    console.log("Recipe added with ID:", docRef.id);
  } catch (error) {
    console.error("Error adding recipe:", error);
  }
};

export const fetchCommunityRecipes = async () => {
  try {
    const q = query(collection(db, "communityRecipes"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const recipes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return recipes;
  } catch (error) {
    console.error("Error fetching recipes:", error);
  }
};

export const likeRecipe = async (recipeId) => {
  try {
    const recipeRef = doc(db, "communityRecipes", recipeId);
    await updateDoc(recipeRef, {
      likes: increment(1),
    });
    console.log("Recipe liked!");
  } catch (error) {
    console.error("Error liking recipe:", error);
  }
};

export const addComment = async (recipeId, comment) => {
  try {
    const recipeRef = doc(db, "communityRecipes", recipeId);
    await updateDoc(recipeRef, {
      comments: arrayUnion(comment),
    });
    console.log("Comment added!");
  } catch (error) {
    console.error("Error adding comment:", error);
  }
};
