import { Router } from "express";
import { createGoal, deleteGoal, getGoals, updateGoal } from "../controllers/goal.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.post("/", createGoal);
router.get("/", getGoals);
router.put("/:id", updateGoal);
router.delete("/:id", deleteGoal);

export default router;
