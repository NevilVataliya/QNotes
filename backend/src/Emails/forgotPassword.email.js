import { SendMailClient } from "zeptomail";
import { ApiError } from "../utils/ApiError.js";

const url = "api.zeptomail.in/"; 
const token = process.env.ZEPTOMAIL_TOKEN;

let client = new SendMailClient({ url, token });


// Wrap in an async IIFE so we can use await.
const forgotPasswordMail = async (otp, email, forgotPasswordUrl) => {
try {
  const info = await client.sendMail({
      from: {
        // TODO: REPLACE THIS. It must be the specific address you verified in ZeptoMail.
        "address": "noreply@qnotes.nevil.codes", 
        "name": "QNotes"
      },
      to: [
        {
          "email_address": {
            "address": email,
            "name": "QNotes User"
          }
        }
      ],
      subject: "Reset Your QNotes Password",
      htmlbody: `<!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #E6E6E6;">
          <table style="width: 100%; background-color: #E6E6E6;">
            <tr>
              <td align="center">
                <table style="max-width: 600px; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 40px 0;">
                  <tr>
                    <td style="padding: 0 30px 30px;">
                      <h2 style="color: #002E63; margin-bottom: 10px;">Password Reset Request</h2>
                      <p style="color: #555;">We received a request to reset your password. Use the code below to reset it:</p>
                      <div style="background: #E6E6E6; border-radius: 6px; padding: 15px; margin: 20px auto; width: 180px; text-align: center;">
                        <span style="color: #002E63; font-size: 30px; font-weight: bold; letter-spacing: 5px;">${otp}</span>
                      </div>
                      <a href="${forgotPasswordUrl}" style="text-decoration: none;">
                        <div style="background: #26D400; border-radius: 4px; padding: 12px; margin: 25px auto; width: 200px; text-align: center;">
                          <span style="color: #fff; font-size: 16px; font-weight: bold;">Reset Password</span>
                        </div>
                      </a>
                      <p style="color: #555; font-size: 14px;">This code will expire in 15 minutes.</p>
                      <p style="color: #C40000; font-size: 13px; margin-top: 30px;">If you did not request a password reset, please ignore this email.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align: center; color: #555; padding-bottom: 16px; font-size: 13px;">
                      Made with ♥ in India<br>
                      <span style="color: #002E63; font-size: 12px;">© 2025 QNotes. All rights reserved.</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>`,
  });
    console.log("Message sent:", info);
} catch (error) {
  console.error("Error sending email:", error);
  console.log("details:", error?.error?.details);
  throw new ApiError(500, "Error sending forgot password email");
}
};

export {
    forgotPasswordMail
}