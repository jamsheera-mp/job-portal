import { Router } from 'express';
import { AuthController } from '../application/controllers/auth.controller';



const router = Router();
const authController = new AuthController();



// Debugging middleware to log all incoming requests
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

router.post('/register', (req, res) => authController.register(req, res));
router.post('/resend-otp', (req, res) => authController.resendOtp(req, res));
router.post('/verify-otp', (req, res) => authController.verifyOtp(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));


    
export default router;