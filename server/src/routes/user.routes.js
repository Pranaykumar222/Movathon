import { Router } from "express";
import { deleteCurrentUser, getPublicProfile } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.delete("/me", authenticate, deleteCurrentUser);

// Public route - NO authentication middleware
router.get("/:username/public", getPublicProfile);

export default router;
