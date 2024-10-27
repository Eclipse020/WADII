// src/services/historyService.js
import { db } from "./firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

export const addCookingHistory = async (userId, recipeId, date, calories) => {
  try {
    const docRef = await addDoc(collection(db, "cookingHistory"), {
      userId,
      recipeId,
      date: date.toISOString(),
      calories,
    });
    console.log("Cooking history added with ID:", docRef.id);
  } catch (error) {
    console.error("Error adding cooking history:", error);
  }
};

export const fetchCookingHistory = async (userId) => {
  try {
    const q = query(collection(db, "cookingHistory"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const history = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return history;
  } catch (error) {
    console.error("Error fetching cooking history:", error);
  }
};
