import { Router } from "express";
import authRoutes from "./auth.routes";
import adminRoutes from "./admin.routes";
import profileRoutes from './profile.routes'

const router = Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/profile", profileRoutes)

export default router;