import { db } from './firebase'; 
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  arrayUnion 
} from 'firebase/firestore'; 

// Function to create a recipe 
export async function createRecipe(recipe) { 
    const recipeRef = collection(db, 'recipes');  // Get a reference to the 'recipes' collection 
    recipe.ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [recipe.ingredients];
    recipe.likeCount = 0; // Initialize like count
    recipe.comments = []; // Initialize comments array
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
  const recipeRef = doc(db, 'recipes', id); // Get a reference to the document
  const docSnapshot = await getDoc(recipeRef); // Fetch the document snapshot

  if (docSnapshot.exists()) {
    return { 
      id: docSnapshot.id, 
      ...docSnapshot.data(), 
      ingredients: docSnapshot.data().ingredients || [], // Ensure ingredients is always an array 
    }; // Return the ID along with the data
  } else {
    throw new Error('No such recipe!');
  }
}

// Function to update the like count of a recipe
export async function updateRecipeLikes(recipeId, likeCount) {
    const recipeRef = doc(db, 'recipes', recipeId);
    await updateDoc(recipeRef, {
      likeCount: likeCount,
    });
  }

// Function to save a comment for a recipe
export async function saveComment(id, comment) {
  const recipeRef = doc(db, 'recipes', id); // Get a reference to the specific recipe document
  await updateDoc(recipeRef, {
    comments: arrayUnion(comment) // Use arrayUnion to add the comment to the comments array
  });
}
