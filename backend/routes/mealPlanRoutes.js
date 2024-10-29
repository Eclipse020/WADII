import express from 'express';
const router = express.Router();
import authenticateToken from '../middleware/auth.js'; // Middleware to check for auth token
import mealPlanController from '../controllers/mealPlanController.js';

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Meal Plan routes
router.get('/plan', mealPlanController.getMealPlan);
router.put('/plan', mealPlanController.updateMealPlan);

// Favorites routes
router.get('/favorites', mealPlanController.getFavorites);
router.put('/favorites', authenticateToken, mealPlanController.updateFavorites);

// Shopping List routes
router.get('/shopping-list', mealPlanController.getShoppingList);
router.put('/shopping-list', mealPlanController.updateShoppingList);

// Fridge Sync route
router.post('/sync-fridge', mealPlanController.syncWithFridge);

export default router;