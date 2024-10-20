// backend/controllers/mealPlanController.js
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

export const getMealPlan = async (req, res) => {
  try {
    const mealPlanDoc = await db.collection('mealPlans').doc('currentPlan').get();
    if (mealPlanDoc.exists) {
      res.json(mealPlanDoc.data());
    } else {
      res.status(404).send('Meal plan not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const addToShoppingList = async (req, res) => {
  const { item } = req.body; // Assuming the item is sent in the request body
  try {
    await db.collection('shoppingLists').add({ item, addedAt: new Date() });
    res.status(201).send('Item added to shopping list');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getShoppingList = async (req, res) => {
  try {
    const snapshot = await db.collection('shoppingLists').get();
    const shoppingList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(shoppingList);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Add other controller functions as needed
