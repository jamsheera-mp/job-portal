import { Router } from "express";
import { AdminController } from "../application/controllers/admin.controller";

const router = Router();
const adminController = new AdminController();

router.get("/users", adminController.getAllUsers.bind(adminController));
router.put("/users/:id", adminController.editUser.bind(adminController));
router.delete("/users/:id", adminController.deleteUser.bind(adminController));

export default router;