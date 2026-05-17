import { Router } from "express";
import { getPublicProfile } from "../controllers/user.controller.js";

const router = Router();

// Public route - NO authentication middleware
router.get("/:username/public", getPublicProfile);

export default router;
