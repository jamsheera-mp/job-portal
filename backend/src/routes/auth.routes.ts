import { Router } from 'express';
import { AuthController } from '../application/controllers/auth.controller';
import passport from '../infrastructure/auth/passport.config'


const router = Router();
const authController = new AuthController();

// Initialize Passport
router.use(passport.initialize());

router.post('/register', (req, res) => authController.register(req, res));
router.post('/resend-otp', (req, res) => authController.resendOtp(req, res));
router.post('/verify-otp', (req, res) => authController.verifyOtp(req, res));
router.post('/login', (req, res) => authController.login(req, res));

// Google Sign-In routes
router.get('/auth/google', (req, res) => authController.googleAuth(req, res));
router.get('/auth/google/callback', (req, res) => authController.googleAuthCallback(req, res));

// LinkedIn Sign-In routes
router.get('/auth/linkedin', (req, res) => authController.linkedInAuth(req, res));
router.get('/auth/linkedin/callback', (req, res) => authController.linkedInAuthCallback(req, res));

export default router;