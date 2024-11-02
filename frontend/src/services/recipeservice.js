// CRecipeService.js 
import { db } from './firebase'; 
import { collection, getDocs, addDoc, deleteDoc, doc, getDoc } from 'firebase/firestore'; 
 
// Function to create a recipe 
export async function createRecipe(recipe) { 
  const recipeRef = collection(db, 'recipes');  // Get a reference to the 'recipes' collection 
  recipe.ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [recipe.ingredients];
  await addDoc(recipeRef, recipe);              // Use addDoc to add a document 
} 
 
// Function to save a draft 
export async function saveDraft(recipe) { 
  const draftRef = collection(db, 'drafts');    // Get a reference to the 'drafts' collection 
  await addDoc(draftRef, recipe);               // Use addDoc to add a document 
} 
 
// Function to get all drafts 
export async function getDrafts() { 
  const draftRef = collection(db, 'drafts');    // Get a reference to the 'drafts' collection 
  const snapshot = await getDocs(draftRef);     // Use getDocs to retrieve all documents in the collection 
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); 
} 
 
// Function to delete a draft by ID 
export async function deleteDraft(id) { 
  const draftDocRef = doc(db, 'drafts', id);    // Get a reference to the specific draft document 
  await deleteDoc(draftDocRef);                 // Use deleteDoc to delete the document 
} 
 
// Function to get all recipes 
export async function getRecipes() { 
  const recipeRef = collection(db, 'recipes');  // Get a reference to the 'recipes' collection 
  const querySnapshot = await getDocs(recipeRef);  // Use getDocs to retrieve all documents in the collection 
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); 
} 
 
// Function to get a recipe by ID 
export async function getRecipeById(id) {
  const recipeRef = doc(db, 'recipes', id); // Get a reference to the specific recipe document
  const recipeDoc = await getDoc(recipeRef); // Use getDoc to retrieve the document

  if (recipeDoc.exists()) {
    return {
      id: recipeDoc.id, // Include the document ID
      ...recipeDoc.data(),
      ingredients: recipeDoc.data().ingredients || [], // Ensure ingredients is always an array
      comments: recipeDoc.data().comments || [], // Ensure comments is always an array
    };
  } else {
    throw new Error('Recipe not found'); // Handle case where the recipe does not exist
  }
}