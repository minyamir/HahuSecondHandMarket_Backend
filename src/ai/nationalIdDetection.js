import { GoogleGenerativeAI } from "@google/generative-ai"; // Standard SDK import
import fs from "fs";
import path from "path";

// Initialize with the more robust SDK class
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const prepareFileForAI = (fileArray) => {
    if (!fileArray || fileArray.length === 0) return null;
    const file = fileArray[0];
    const data = fs.readFileSync(file.path).toString("base64");
    
    const ext = path.extname(file.path).toLowerCase();
    let mimeType = "image/jpeg";
    if (ext === ".png") mimeType = "image/png";
    if (ext === ".mp4") mimeType = "video/mp4";
    if (ext === ".mov") mimeType = "video/quicktime";
    if (ext === ".webm") mimeType = "video/webm";

    return { inlineData: { mimeType, data } };
};

export const performDeepAudit = async (files, registeredName) => {
    // 1. SET THE RUTHLESS SYSTEM INSTRUCTION
    const model = genAI.getGenerativeModel({ 
        model: "gemini-3.1-flash-lite-preview",
        systemInstruction: "You are a Forensic Fraud Agent for HaHu Market. Your only goal is to detect identity mismatch. Do not be helpful. If the person in the selfie/video is not 100% identical to the ID photo, you MUST REJECT. Look for microscopic differences in bone structure and ear shape."
    });

const prompt = `

    CRITICAL SECURITY AUDIT & FORENSIC ANALYSIS FOR HAHU MARKET:

    

    SOURCE FILES:

    1. idFront (The Master Reference)

    2. idBack

    3. faceFront, faceLeft, faceRight (Selfies)

    4. livenessVideo (5-second motion check)



    STEP 1: IDENTITY ANCHORING & DATA EXTRACTION

    - Analyze 'idFront'. Extract the photo of the person. This is the ONLY reference.

    - Locate and extract the FCN (File Control Number).

    - Read the full name printed on the ID and compare to registered User Name: "${registeredName}".

    - Inspect the QR code pattern on 'idFront'. Does data match the printed FCN and Name?



    STEP 2: THE 1-TO-1 SEQUENTIAL SELFIE MATCH

    - Compare 'idFront' photo (Master) directly to 'faceFront' selfie.

    - Compare 'idFront' photo to 'faceLeft' and 'faceRight'.

    - MANDATORY REJECTION: If jawline, nose bridge, or eye spacing varies by more than 2% between the ID photo and any selfie, you MUST REJECT.



    STEP 3: VIDEO MOTION & CROSS-REFERENCE ANALYSIS

    - Watch 'livenessVideo'. Detect EYE BLINKING and slow head rotation (Front -> Left -> Right).

    - Analyze the face in the video at 0s, 2s, and 5s. 

    - CROSS-REFERENCE: Does the person in the video match all 3 selfie photos AND the ID photo perfectly?

    - If the video shows a person different from the ID photo, even slightly, it is FRAUD.



    STEP 4: SPOOF & INTEGRITY DETECTION

    - Check for screen glare, pixels, or "photo-of-a-photo" indicators.

    - Verify 3D ear structure in 'faceLeft/Right' to defeat 2D masks.

    - Verify card consistency with official Ethiopian standards.



    STRICT FRAUD PREVENTION RULES (ZERO TOLERANCE):

    - IDENTITY MISMATCH: Any structural difference in facial features = REJECT.

    - LIVENESS FAILURE: No blink or no rotation = REJECT.

    - WHEN IN DOUBT: If images are blurry or confidence is not 100%, set to REJECT.



    Respond ONLY in JSON format:

    {

        "fullNameOnId": "...",

        "fcnNumber": "...",

        "qrMatch": true,

        "nameMatches": true,

        "faceMatchScore": 0-100,

        "videoLivenessConfirmed": true,

        "earsVerified": true,

        "allFilesMatch": true,

        "decision": "APPROVE" | "FLAG" | "REJECT",

        "reason": "Detailed forensic explanation. Specify if the mismatch was in the selfies, the video, or the ID data."

    }

`;

    try {
        const parts = [
            { text: prompt },
            prepareFileForAI(files.idFront),
            prepareFileForAI(files.idBack),
            prepareFileForAI(files.faceFront),
            prepareFileForAI(files.faceLeft),
            prepareFileForAI(files.faceRight),
            prepareFileForAI(files.livenessVideo)
        ].filter(part => part !== null);

        const result = await model.generateContent({ contents: [{ role: "user", parts }] });
        const response = await result.response;
        
        // Correct way to get text in the latest SDK
        const responseText = typeof response.text === 'function' ? response.text() : response.text;

        const jsonContent = responseText.replace(/```json|```/g, "").trim();
        let audit = JSON.parse(jsonContent);

        // 🛡️ THE SAFETY GATE: Forced Override
        // Even if the AI says APPROVE, we block if the score is below 98%
        if (audit.faceMatchScore < 98 || !audit.allFilesMatch) {
            audit.decision = "REJECT";
            audit.reason = "CRITICAL: Biometric mismatch detected between Master ID and Live samples.";
        }

        return audit;

    } catch (error) {
        console.error("AI Forensic Error:", error);
        return { decision: "REJECT", reason: "System error during biometric analysis." };
    }
};