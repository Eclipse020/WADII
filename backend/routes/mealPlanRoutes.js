const express = require('express');
const router = express.Router();
const mealPlanController = require('../controllers/mealPlanController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Meal Plan routes
router.get('/plan', mealPlanController.getMealPlan);
router.put('/plan', mealPlanController.updateMealPlan);

// Favorites routes
router.get('/favorites', mealPlanController.getFavorites);
router.put('/favorites', mealPlanController.updateFavorites);

// Shopping List routes
router.get('/shopping-list', mealPlanController.getShoppingList);
router.put('/shopping-list', mealPlanController.updateShoppingList);

// Fridge Sync route
router.post('/sync-fridge', mealPlanController.syncWithFridge);

module.exports = router;