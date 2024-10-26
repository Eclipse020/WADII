// CRecipeService.js
import { db } from '@/services/firebase'; // Adjust path if necessary
import { collection, getDocs } from 'firebase/firestore';

// const db = firebase.firestore();

export async function createRecipe(recipe) {
  await db.collection('recipes').add(recipe);
}

export async function saveDraft(recipe) {
  await db.collection('drafts').add(recipe);
}

export async function getDrafts() {
  const snapshot = await db.collection('drafts').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deleteDraft(id) {
  await db.collection('drafts').doc(id).delete();
}

export async function getRecipes() {
  const querySnapshot = await getDocs(collection(db, 'recipes')); // Ensure 'recipes' is the correct collection name
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getRecipeById(id) {
  const doc = await db.collection('recipes').doc(id).get();
  return { id: doc.id, ...doc.data() };
}
