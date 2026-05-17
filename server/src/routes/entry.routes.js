import { Router } from "express";
import { createOrUpdateEntry, getEntriesByHabit } from "../controllers/entry.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.post("/", createOrUpdateEntry);
router.get("/:habitId", getEntriesByHabit);

export default router;