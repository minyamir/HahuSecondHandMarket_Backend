import * as verificationService from '../services/verification.service.js';

export const handleVerificationSubmit = async (req, res) => {
    try {
        // 1. Check if files exist (Multer stores them in req.files)
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "No verification files were uploaded." 
            });
        }

        // 2. Define the required fields for your "Iron Gate" security
        const requiredFields = [
            'idFront', 
            'idBack', 
            'faceFront', 
            'faceLeft', 
            'faceRight', 
            'livenessVideo'
        ];

        // 3. Validation: Ensure every specific angle was captured
        for (const field of requiredFields) {
            if (!req.files[field] || !req.files[field][0]) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Missing required upload: ${field}. Please complete all steps.` 
                });
            }
        }

        // 4. Pass the entire req.files object to the service
        // Your service is now designed to extract the paths itself
        const result = await verificationService.verifyIdentity(
            req.user.id, 
            req.files 
        );

        // 5. Success Response
        // We use the message from the service (e.g., "Under Review" or "Verified")
        res.status(200).json({ 
            success: result.success, 
            status: result.status,
            message: result.message 
        });

    } catch (error) {
        console.error("Verification Controller Error:", error.message);
        
        // Use 403 for security rejections, 500 for server crashes
        const statusCode = error.message.includes("Security") ? 403 : 500;
        
        res.status(statusCode).json({ 
            success: false, 
            message: error.message || "An error occurred during identity processing." 
        });
    }
};