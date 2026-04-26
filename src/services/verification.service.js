import Verification from '../models/Verification.model.js';
import User from '../models/User.model.js';
import { performDeepAudit } from '../ai/nationalIdDetection.js';
import fs from 'fs';

export const verifyIdentity = async (userId, files) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User context not found.");

    const audit = await performDeepAudit(files, user.fullName);

    // 1. DUPLICATE FCN LOCK
    const fcn = audit.fcnNumber || "UNKNOWN";
    const duplicateId = await Verification.findOne({ fcnNumber: fcn });
    if (duplicateId && duplicateId.userId.toString() !== userId) {
        cleanupAllFiles(files);
        throw new Error("Security Alert: This National ID is already registered to another HaHu Market account.");
    }

    // 2. HARD-BLOCK LOGIC (Scam/Fraud Prevention)
    // We check audit.success or audit.decision directly from the AI bridge
    if (audit.faceMatchScore < 40 || audit.decision === "REJECT") {
        cleanupAllFiles(files);
        throw new Error(`Security Rejection: ${audit.reason || "Biometric verification failed."}`);
    }

    // 3. DATA NORMALIZATION & MAPPING
    // Map AI JSON keys to your local logic
    const trustScore = audit.faceMatchScore || 0;
    const livenessOk = audit.videoLivenessConfirmed === true;
    const earsOk = audit.earsVerified === true;
    
    // Normalize names (remove extra spaces/case sensitivity) to prevent false flags
    const registeredName = user.fullName.trim().toLowerCase();
    const idName = (audit.fullNameOnId || "").trim().toLowerCase();
    const nameMatches = idName.includes(registeredName) || registeredName.includes(idName) || audit.nameMatches === true;

    // 4. DETERMINE FINAL STATUS
    let finalStatus = 'approved';

    const triggersFlag = 
        trustScore < 95 ||        // Raised threshold for auto-approval
        !livenessOk || 
        !earsOk || 
        !nameMatches || 
        audit.decision === "FLAG";

    if (triggersFlag) {
        finalStatus = 'flagged';
    }

    // 5. UPDATE OR CREATE RECORD
    const record = await Verification.findOneAndUpdate(
        { userId },
        {
            fullNameOnId: audit.fullNameOnId || "Unknown",
            fcnNumber: fcn,
            idImageFront: files.idFront[0].path, 
            idImageBack: files.idBack[0].path,
            faceFrontPath: files.faceFront[0].path,
            faceLeftPath: files.faceLeft[0].path,
            faceRightPath: files.faceRight[0].path,
            blinkDetected: livenessOk, // Mapping AI result to DB field
            earsVerified: earsOk,
            trustScore: trustScore,
            aiReason: audit.reason,
            status: finalStatus,
            $inc: { attempts: 1 },
            lastAttemptAt: Date.now()
        },
        { upsert: true, new: true }
    );

    // 6. UNLOCK USER
    if (finalStatus === 'approved') {
        await User.findByIdAndUpdate(userId, { 
            isVerified: true,
            verificationRecord: record._id 
        });
    }

    // 7. CLEANUP SENSITIVE VIDEO
    if (files.livenessVideo && files.livenessVideo[0] && fs.existsSync(files.livenessVideo[0].path)) {
        fs.unlinkSync(files.livenessVideo[0].path);
    }

    return { 
        success: finalStatus === 'approved', 
        status: finalStatus,
        score: trustScore,
        message: finalStatus === 'flagged' 
            ? `Reviewing: ${audit.reason}`
            : "Verification successful! Welcome to the trusted seller community."
    };
};

const cleanupAllFiles = (files) => {
    Object.keys(files).forEach(key => {
        files[key].forEach(file => {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });
    });
};