// backend/server.js
import express from 'express';
import cors from 'cors'; // Import CORS
import firebaseApp from './config/firebaseConfig.js';
import { getFirestore } from 'firebase-admin/firestore';
import mealPlanRoutes from './routes/mealPlanRoutes.js';

const app = express();
const db = getFirestore(firebaseApp);
const admin = require("firebase-admin");
const serviceAccount = require("./path/to/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(cors()); // Use CORS middleware
app.use(express.json()); // To parse JSON request bodies

app.use('/api', mealPlanRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
