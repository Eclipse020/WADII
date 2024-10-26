const admin = require('firebase-admin');
const db = admin.firestore();

exports.getMealPlan = async (req, res) => {
    try {
        const userId = req.user.uid;
        const mealPlanRef = db.collection('users').doc(userId).collection('mealPlanner').doc('current');
        const doc = await mealPlanRef.get();

        if (!doc.exists) {
            // Initialize with empty meal plan if it doesn't exist
            const emptyMealPlan = {
                days: [
                    { name: 'Monday', recipes: [] },
                    { name: 'Tuesday', recipes: [] },
                    { name: 'Wednesday', recipes: [] },
                    { name: 'Thursday', recipes: [] },
                    { name: 'Friday', recipes: [] },
                    { name: 'Saturday', recipes: [] },
                    { name: 'Sunday', recipes: [] },
                ]
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

exports.updateMealPlan = async (req, res) => {
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

exports.getFavorites = async (req, res) => {
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

exports.updateFavorites = async (req, res) => {
    console.log("Request Body:", req.body); // Log the incoming request body
    try {
        const userId = req.user.uid;
        const { recipes } = req.body;
        
        await db.collection('users').doc(userId).collection('mealPlanner').doc('favorites')
            .set({ recipes }, { merge: true });
        
        res.json({ message: 'Favorites updated successfully' });
    } catch (error) {
        console.error('Error updating favorites:', error);
        res.status(500).json({ error: 'Failed to update favorites' });
    }
};


exports.getShoppingList = async (req, res) => {
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

exports.updateShoppingList = async (req, res) => {
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

exports.syncWithFridge = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { items } = req.body;
        
        // Get current fridge inventory
        const fridgeRef = db.collection('users').doc(userId).collection('items');
        
        // Add new items to fridge
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