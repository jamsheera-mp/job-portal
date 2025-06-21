
import { Router, Request, Response, NextFunction } from 'express';
import { ProfileController } from '../application/controllers/profile.controller';
import { JwtService } from '../infrastructure/services/jwt.service';

const router = Router();
const profileController = new ProfileController();
const jwtService = new JwtService();

// Debugging middleware to log all incoming requests
router.use((req:Request, res:Response, next:NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});


//authentication middleware
const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      res.status(401).json({ message: 'No access token provided' });
      return;
    }
    const decoded = jwtService.verifyAccessToken(token);
    if (!decoded || !decoded.id) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
    req.user = decoded;
    next();
  } catch (error: any) {
    console.error('[Authenticate] Error:', error.message);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

router.get('/', authenticate, (req: Request, res:Response) => profileController.getProfile(req, res));
router.patch('/', authenticate, (req: Request, res:Response) => profileController.updateProfile(req, res));

export default router;