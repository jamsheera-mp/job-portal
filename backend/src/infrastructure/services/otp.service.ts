import { TempUserModel } from '../../domain/entities/tempUser.entity';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv'
import SMTPTransport from 'nodemailer/lib/smtp-transport';


dotenv.config()

export class OtpService {
  private transporter: nodemailer.Transporter;


  constructor() {
    // Validate environment variables
    const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
    const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);
    if (missingEnvVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
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

    // Verify the transporter configuration at startup
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('SMTP Transporter Error:', error.message);
      } else {
        console.log('SMTP Transporter Ready:', success);
      }
    });
  }
  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async generateOtp(email: string, userData: any): Promise<void> {
    const otp = this.generateOtpCode();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const existingTempUser = await TempUserModel.findOne({ email });
    if (existingTempUser) {
      await TempUserModel.deleteOne({ email });
    }

    const tempUser = new TempUserModel({
      ...userData,
      otp,
      otpExpires,
    });

    await tempUser.save();

    // Send OTP via email
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Your OTP for Registration',
      text: `Your OTP for registration is ${otp}. It is valid for 10 minutes.`,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const tempUser = await TempUserModel.findOne({ email });
    if (!tempUser) {
      return false;
    }

    if (tempUser.otp !== otp || tempUser.otpExpires < new Date()) {
      return false;
    }

    return true;
  }

  async getTempUser(email: string): Promise<any> {
    const tempUser = await TempUserModel.findOne({ email });
    return tempUser;
  }

  async deleteTempUser(email: string): Promise<void> {
    await TempUserModel.deleteOne({ email });
  }
}