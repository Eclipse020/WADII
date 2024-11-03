import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as serviceAccount from '../serviceAccountKey.json' assert { type: "json" };

const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: "healthychef-a4655"
});

const db = getFirestore(app);

export default db;