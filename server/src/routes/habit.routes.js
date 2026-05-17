import { Router } from "express";
import { createHabit, getHabits, updateHabit, deleteHabit } from "../controllers/habit.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// All habit routes are protected
router.use(authenticate);

router.post("/", createHabit);
router.get("/", getHabits);
router.put("/:id", updateHabit);
router.delete("/:id", deleteHabit);

export default router;