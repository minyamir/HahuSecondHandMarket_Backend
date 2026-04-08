import axios from "axios";

export const sendWelcomeEmail = async ({ toEmail, fullName }) => {
  console.log("Attempting to send welcome email to:", toEmail);

  // Debugging: Check if keys are actually loaded on Render
  if (!process.env.BREVO_API_KEY) {
    console.error("FATAL ERROR: BREVO_API_KEY is missing in Environment Variables!");
  }

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: process.env.BREVO_SENDER_NAME || "ሀሁ Market",
          email: process.env.BREVO_SENDER_EMAIL
        },
        to: [{ email: toEmail, name: fullName }],
        subject: "Welcome to ሀሁ Market 🎉",
        htmlContent: `...` // Keep your beautiful HTML here
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Brevo Success Response:", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      // This prints the EXACT reason Brevo rejected the request
      console.error("BREVO REJECTION DETAILS:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers['api-key'] ? 'Present' : 'Missing'
      });
    } else {
      console.error("BREVO NETWORK ERROR:", error.message);
    }
    
    // We do NOT throw the error here so the User Registration finishes successfully
    // even if the email service is being difficult.
    return null; 
  }
};