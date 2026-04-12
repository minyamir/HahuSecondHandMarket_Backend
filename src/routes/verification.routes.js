import express from 'express';
import { handleVerificationSubmit } from '../controllers/verification.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// --- ADD THIS CODE HERE ---
const uploadFields = upload.fields([
    { name: 'idFront', maxCount: 1 },
    { name: 'idBack', maxCount: 1 },
    { name: 'faceFront', maxCount: 1 },
    { name: 'faceLeft', maxCount: 1 },
    { name: 'faceRight', maxCount: 1 },
    { name: 'livenessVideo', maxCount: 1 }
]);

// Apply it to your POST route
router.post('/submit', authMiddleware, uploadFields, handleVerificationSubmit);

export default router;