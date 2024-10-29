// auth.js
import admin from 'firebase-admin';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(), // or your specific credential method
        // other settings if needed
    });
}

const authenticateToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: 'Token missing' });

    console.log("Token received:", token); // Log the received token

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        console.log("Decoded token:", decodedToken);
        req.user = { id: decodedToken.uid }; // Attach `userId` to `req.user`
        next();
    } catch (error) {
        console.error('Authentication failed:', error);
        res.status(403).json({ error: 'Forbidden' });
    }
};

export default authenticateToken;
