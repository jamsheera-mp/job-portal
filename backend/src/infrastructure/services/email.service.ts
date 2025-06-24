

import nodemailer from "nodemailer";
import dotenv from "dotenv";
import SMTPTransport from "nodemailer/lib/smtp-transport";

dotenv.config();

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const requiredEnvVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];
    const missing = requiredEnvVars.filter((v) => !process.env[v]);
    if (missing.length > 0) {
      throw new Error(`Missing env vars: ${missing.join(", ")}`);
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    } as SMTPTransport.Options);

    this.transporter.verify((err, success) => {
      if (err) {
        console.error("[EmailService] SMTP Error:", err.message);
      } else {
        console.log("[EmailService] SMTP Transporter Ready");
      }
    });
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Your OTP for Email Verification",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    };

    await this.transporter.sendMail(mailOptions);
    console.log(`[EmailService] OTP email sent to ${email}`);
  }
}
