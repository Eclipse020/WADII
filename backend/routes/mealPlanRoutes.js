// backend/routes/mealPlanRoutes.js
import express from 'express';
import { getMealPlan, addToShoppingList, getShoppingList } from '../controllers/mealPlanController.js';

const router = express.Router();

router.get('/mealplan', getMealPlan);
router.post('/shoppinglist', addToShoppingList);
router.get('/shoppinglist', getShoppingList);

export default router;
