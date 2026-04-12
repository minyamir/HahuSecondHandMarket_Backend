import Verification from '../models/Verification.model.js';
import User from '../models/User.model.js';
import { performDeepAudit } from '../ai/nationalIdDetection.js';
import fs from 'fs';

export const verifyIdentity = async (userId, files) => {
    // 0. Fetch the registered user's name to compare against the ID
    const user = await User.findById(userId);
    if (!user) throw new Error("User context not found.");

    // 1. Call the Forensic Deep Audit (Passing user name for AI comparison)
    const audit = await performDeepAudit(files, user.fullName);

    // 2. THE "FCN" DUPLICATE LOCK
    // Check if this National ID (FCN) is already used by someone else
    const duplicateId = await Verification.findOne({ fcnNumber: audit.fcnNumber });
    if (duplicateId && duplicateId.userId.toString() !== userId) {
        cleanupAllFiles(files);
        throw new Error("Security Alert: This National ID is already registered to another HaHu Market account.");
    }

    // 3. Immediate Hard-Block Logic (Scam Detection)
    if (audit.faceMatchScore < 40 || audit.decision === "REJECT" || !audit.qrMatch) {
        cleanupAllFiles(files);
        throw new Error(`Security Rejection: ${audit.reason}`);
    }

    // 4. Determine Final Status
    // Only auto-approve if ALL security checks pass perfectly
    let finalStatus = 'approved';
    if (
        audit.faceMatchScore < 90 || 
        !audit.earsVerified || 
        !audit.blinkDetected || 
        !audit.nameMatches
    ) {
        finalStatus = 'flagged';
    }

    // 5. Update or Create the Verification Record
    const record = await Verification.findOneAndUpdate(
        { userId },
        {
            fullNameOnId: audit.fullNameOnId,
            fcnNumber: audit.fcnNumber,
            idImageFront: files.idFront[0].path, 
            idImageBack: files.idBack[0].path,
            faceFrontPath: files.faceFront[0].path,
            faceLeftPath: files.faceLeft[0].path,
            faceRightPath: files.faceRight[0].path,
            blinkDetected: audit.blinkDetected,
            earsVerified: audit.earsVerified,
            trustScore: audit.faceMatchScore,
            aiReason: audit.reason,
            status: finalStatus,
            $inc: { attempts: 1 },
            lastAttemptAt: Date.now()
        },
        { upsert: true, new: true }
    );

    // 6. Unlock User Capabilities
    if (finalStatus === 'approved') {
        await User.findByIdAndUpdate(userId, { 
            isVerified: true,
            verificationRecord: record._id 
        });
    }

    // 7. Cleanup: Delete the heavy/sensitive video
    if (fs.existsSync(files.livenessVideo[0].path)) {
        fs.unlinkSync(files.livenessVideo[0].path);
    }

    return { 
        success: finalStatus === 'approved', 
        status: finalStatus,
        score: audit.faceMatchScore,
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