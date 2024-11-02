// src/services/RecipeService.js

import { db } from './firebase'; // Make sure firebase.js exports 'db' for Firestore
import { collection, addDoc, getDocs, orderBy, query } from 'firebase/firestore';

const recipesCollection = collection(db, 'recipes'); // The Firestore collection for recipes

// Function to add a new recipe to Firestore
export async function addRecipe(recipe) {
  try {
    // Add a new document in the "recipes" collection with the recipe data
    const docRef = await addDoc(recipesCollection, recipe);
    console.log("Recipe added with ID:", docRef.id);
    return docRef.id; // Return the document ID
  } catch (error) {
    console.error("Error adding recipe:", error);
    throw error; // Throw error to handle it in the component
  }
}

// Function to retrieve all recipes (ordered by creation date)
export async function getRecipes() {
  try {
    // Query to get recipes in descending order based on timestamp
    const recipesQuery = query(recipesCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(recipesQuery);

    // Map the documents to their data
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error retrieving recipes:", error);
    throw error;
  }
}
