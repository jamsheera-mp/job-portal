import { Router } from 'express';
import { RegisterController } from '../../application/controllers/auth/register.controller';
import { VerifyOtpController } from '../../application/controllers/auth/verify-otp.controller';
import { ResendOtpController } from '../../application/controllers/auth/resend-otp.controller';
import { AuthController } from '../../application/controllers/auth.controller'; // for login, logout, etc.
import { requestLogger } from '../middleware/logger.middleware';
import { registerSchema } from '../schemas/auth/register.schema';
import { validate } from '../middleware/validate';


const router = Router();

router.use(requestLogger);

// Controllers
const registerController = new RegisterController();
const verifyOtpController = new VerifyOtpController();
const resendOtpController = new ResendOtpController();
const authController = new AuthController();



// Registration & OTP
router.post('/register', validate(registerSchema),  (req, res) => registerController.register(req, res));
router.post('/verify-otp', (req, res) => verifyOtpController.verifyOtp(req, res));
router.post('/resend-otp', (req, res) => resendOtpController.resendOtp(req, res));

// Auth
router.post('/login', (req, res) => authController.login(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));
router.post('/reset-password', (req, res) => authController.resetPassword(req, res));

export default router;
