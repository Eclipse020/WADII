// backend/server.js
import express from 'express';
import firebaseApp from './config/firebaseConfig.js';
import { getFirestore } from 'firebase-admin/firestore';
import mealPlanRoutes from './routes/mealPlanRoutes.js';

const app = express();
const db = getFirestore(firebaseApp);

app.use(express.json()); // To parse JSON request bodies

app.use('/api', mealPlanRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
