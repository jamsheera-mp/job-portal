import { Router } from 'express';
import { AuthController } from '../application/controllers/auth.controller';

const router = Router();
const authController = new AuthController();

router.post('/register', (req, res) => authController.register(req, res));
router.post('/verify-otp', (req, res) => authController.verifyOtp(req, res));
router.post('/resend-otp', (req, res) => authController.resendOtp(req, res));
router.post('/login', (req, res) => authController.login(req, res));

export default router;