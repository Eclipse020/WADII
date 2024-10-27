import { db } from "./firebase";
import { collection, addDoc, query, getDocs } from "firebase/firestore";

// Change to store history under each user's collection
export const addCookingHistory = async (userId, recipeId, date, calories) => {
  try {
    const docRef = await addDoc(collection(db, `users/${userId}/cookingHistory`), {
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
    // Query the user's specific cooking history collection
    const q = query(collection(db, `users/${userId}/cookingHistory`));
    const querySnapshot = await getDocs(q);
    const history = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return history;
  } catch (error) {
    console.error("Error fetching cooking history:", error);
    return []; // Return an empty array on error
  }
};
