// backend/controllers/mealPlanController.js

import app from '../config/firebaseConfig.js'; // Adjust the path as necessary
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore(app);

const getMealPlan = async (req, res) => {
    try {
        const userId = req.user.uid;
        const mealPlanRef = db.collection('users').doc(userId).collection('mealPlanner').doc('current');
        const doc = await mealPlanRef.get();

        if (!doc.exists) {
            // Initialize with empty meal plan if it doesn't exist
            const emptyMealPlan = {
                days: Array.from({ length: 7 }, (_, i) => ({
                    name: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i],
                    recipes: [],
                })),
            };
            await mealPlanRef.set(emptyMealPlan);
            return res.json(emptyMealPlan);
        }

        res.json(doc.data());
    } catch (error) {
        console.error('Error getting meal plan:', error);
        res.status(500).json({ error: 'Failed to get meal plan' });
    }
};

// Update meal plan
const updateMealPlan = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { days } = req.body;

        await db.collection('users').doc(userId).collection('mealPlanner').doc('current')
            .set({ days }, { merge: true });

        res.json({ message: 'Meal plan updated successfully' });
    } catch (error) {
        console.error('Error updating meal plan:', error);
        res.status(500).json({ error: 'Failed to update meal plan' });
    }
};

// Get favorites
const getFavorites = async (req, res) => {
    try {
        const userId = req.user.uid;
        const favoritesRef = db.collection('users').doc(userId).collection('mealPlanner').doc('favorites');
        const doc = await favoritesRef.get();

        if (!doc.exists) {
            await favoritesRef.set({ recipes: [] });
            return res.json({ recipes: [] });
        }

        res.json(doc.data());
    } catch (error) {
        console.error('Error getting favorites:', error);
        res.status(500).json({ error: 'Failed to get favorites' });
    }
};

// Update favorites
const updateFavorites = async (req, res) => {
    const userId = req.user.id; // Assuming you have set req.user after authentication
    const { recipes } = req.body; // Get recipes from request body
  
    try {
      // Assuming you have a user document where you store favorites
      const userRef = db.collection('users').doc(userId).collection('mealPlanner').doc('favorites');
      
      // Update the user's favorites with the new recipes
      await userRef.set({ recipes }, { merge: true });
  
      res.status(200).json({ message: 'Favorites updated successfully!' });
    } catch (error) {
      console.error('Error updating favorites:', error);
      res.status(500).json({ message: 'Failed to update favorites.' });
    }
  };

// Get shopping list
const getShoppingList = async (req, res) => {
    try {
        const userId = req.user.uid;
        const shoppingListRef = db.collection('users').doc(userId).collection('mealPlanner').doc('shoppingList');
        const doc = await shoppingListRef.get();

        if (!doc.exists) {
            await shoppingListRef.set({ items: [] });
            return res.json({ items: [] });
        }

        res.json(doc.data());
    } catch (error) {
        console.error('Error getting shopping list:', error);
        res.status(500).json({ error: 'Failed to get shopping list' });
    }
};

// Update shopping list
const updateShoppingList = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { items } = req.body;

        await db.collection('users').doc(userId).collection('mealPlanner').doc('shoppingList')
            .set({ items }, { merge: true });

        res.json({ message: 'Shopping list updated successfully' });
    } catch (error) {
        console.error('Error updating shopping list:', error);
        res.status(500).json({ error: 'Failed to update shopping list' });
    }
};

// Sync with fridge
const syncWithFridge = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { items } = req.body;

        const fridgeRef = db.collection('users').doc(userId).collection('items');

        for (const item of items) {
            if (item.purchased) {
                await fridgeRef.add({
                    name: item.name,
                    category: 'Other',
                    quantity: 1,
                    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    createdDate: new Date().toISOString(),
                });
            }
        }

        res.json({ message: 'Inventory synced successfully' });
    } catch (error) {
        console.error('Error syncing with fridge:', error);
        res.status(500).json({ error: 'Failed to sync with fridge' });
    }
};

export default {
    getMealPlan,
    updateMealPlan,
    getFavorites,
    updateFavorites,
    getShoppingList,
    updateShoppingList,
    syncWithFridge,
};