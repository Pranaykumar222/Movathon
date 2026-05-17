import { Router } from "express";
import { register, login, getMe, googleLogin } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/me", authenticate, getMe); // Protected

export default router;