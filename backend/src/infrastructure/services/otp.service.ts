import { TempUserModel } from '../../domain/entities/tempUser.entity';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv'
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import bcrypt from 'bcryptjs'

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
    if (process.env.NODE_ENV !== 'production') {
      console.log(`OTP for ${email}: ${otp}`);
    }


    const saltRounds = 10;
    const hashedOtp = await bcrypt.hash(otp, saltRounds);


    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await TempUserModel.deleteOne({ email }); // Delete any existing TempUser

    const tempUser = new TempUserModel({
      ...userData,
      otp:hashedOtp,
      otpExpires,
      attempts: 0, //Reset attempts on new OTP generation
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

  async verifyOtp(email: string, inputOtp: string): Promise<boolean> {
    const tempUser = await TempUserModel.findOne({ email });
    if (!tempUser)  return false;

    if (tempUser.otpExpires < new Date()) return false;

    // Check attempts limit
    const maxAttempts = 5;
    if (tempUser.attempts ?? 0 >= maxAttempts) {
      throw new Error('Maximum OTP verification attempts exceeded. Please request a new OTP.');
    }

    const isMatch = await bcrypt.compare(inputOtp, tempUser.otp);

   if (!isMatch) {
      // Increment attempts on failure
      await TempUserModel.updateOne(
        { email },
        { $inc: { attempts: 1 } }
      );
      return false;
    }

    return true;
  }

  async getTempUser(email: string): Promise<any> {
     return await TempUserModel.findOne({ email });
  }

  async deleteTempUser(email: string): Promise<void> {
    await TempUserModel.deleteOne({ email });
  }
}