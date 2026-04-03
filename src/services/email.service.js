import axios from "axios";

export const sendWelcomeEmail = async ({ toEmail, fullName }) => {
  console.log("Sending welcome email to:", toEmail);

  const response = await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: {
        name: process.env.BREVO_SENDER_NAME || "ሀሁ Market",
        email: process.env.BREVO_SENDER_EMAIL
      },
      to: [
        {
          email: toEmail,
          name: fullName
        }
      ],
      subject: "Welcome to ሀሁ Market 🎉",
      htmlContent: `
        <div style="margin:0;padding:24px;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#111827;">
          <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 8px 30px rgba(0,0,0,0.06);">
            
            <div style="background:linear-gradient(135deg,#16a34a 0%, #0ea5e9 100%);padding:40px 24px;text-align:center;color:#ffffff;">
              <div style="font-size:46px;font-weight:800;letter-spacing:3px;line-height:1;">ሀሁ</div>
              <div style="font-size:18px;margin-top:10px;font-weight:600;">HaHu Market</div>
              <div style="font-size:14px;opacity:0.95;margin-top:8px;">
                Trusted second-hand marketplace for Bahir Dar
              </div>
            </div>

            <div style="padding:36px 28px;">
              <h2 style="margin:0 0 16px;font-size:26px;color:#111827;">
                Hello ${fullName} 👋
              </h2>

              <p style="margin:0 0 14px;font-size:15px;line-height:1.8;color:#374151;">
                Welcome to <strong>ሀሁ Market</strong>. Your account has been created successfully.
              </p>

              <p style="margin:0 0 22px;font-size:15px;line-height:1.8;color:#374151;">
                We’re building a safer and more trusted marketplace where verified users can buy and sell second-hand items with confidence.
              </p>

              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:18px 18px 14px;margin-bottom:24px;">
                <div style="font-size:16px;font-weight:700;color:#166534;margin-bottom:10px;">
                  Your next steps
                </div>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:8px 0;font-size:15px;color:#14532d;">✅ Complete your profile</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-size:15px;color:#14532d;">✅ Submit your National ID for verification</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-size:15px;color:#14532d;">✅ Get your green verified badge</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-size:15px;color:#14532d;">✅ Start buying or selling on ሀሁ</td>
                  </tr>
                </table>
              </div>

              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:14px;padding:16px 18px;margin-bottom:24px;">
                <div style="font-size:15px;line-height:1.8;color:#1e3a8a;">
                  <strong>Why HaHu Market?</strong><br>
                  Verified sellers, safer listings, and a local marketplace designed for real people in Bahir Dar.
                </div>
              </div>

              <p style="margin:0;font-size:16px;line-height:1.8;color:#111827;">
                Welcome to <span style="color:#16a34a;font-weight:700;">ሀሁ 💚</span>
              </p>
            </div>

            <div style="padding:18px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
              <div style="font-size:12px;color:#6b7280;line-height:1.7;">
                HaHu Market • Bahir Dar, Ethiopia<br>
                This email was sent after your account registration.
              </div>
            </div>
          </div>
        </div>
      `
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json"
      }
    }
  );

  console.log("Brevo response:", response.data);
  return response.data;
};