import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema({
    fcnNumber: { 
        type: String, 
        required: true, 
        unique: true, // Blocks duplicate ID usage
        index: true 
    },
    qrCodeContent: { type: String },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        unique: true // A user should generally only have one active verification record
    },
    idType: { type: String, default: 'National ID' },
    idNumber: { type: String, sparse: true }, // sparse allows multiple 'null' values if not collected yet
    
    // --- Evidence Paths (Crucial for Admin Review) ---
    idImageFront: { type: String, required: true }, // Path to the uploaded ID
    selfieImage: { type: String }, // Path to the "Front" face capture
    
    // --- AI Audit Results ---
    blinkDetected: { type: Boolean, default: false },
    isLive: { type: Boolean, default: false }, // Overall liveness result
    trustScore: { type: Number, required: true, min: 0, max: 100 },
    aiReason: { type: String }, // Detailed explanation from Gemini
    
    // --- Lifecycle Management ---
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected', 'flagged'], 
        default: 'pending' 
    },
    attempts: { type: Number, default: 1 },
    lastAttemptAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexing for faster admin lookups
verificationSchema.index({ status: 1 });

const Verification = mongoose.models.Verification || mongoose.model('Verification', verificationSchema);
export default Verification;