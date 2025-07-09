import { Router } from "express";
import { getSkillEvaluation, searchSkillEvaluation, addSkillEvaluation, updateSkillEvaluation, removeSkillEvaluation } from "../controllers/evaluationController.js"
import authenticateToken from "../middleware/authMiddleware.js";

const evaluationRoutes = Router();

evaluationRoutes.get("/details", authenticateToken, getSkillEvaluation);
evaluationRoutes.get("/search", authenticateToken, searchSkillEvaluation);
evaluationRoutes.post("/add", authenticateToken, addSkillEvaluation);
evaluationRoutes.put("/update/:evalId", authenticateToken, updateSkillEvaluation);
evaluationRoutes.delete("/remove/:evalId", authenticateToken, removeSkillEvaluation);

export default evaluationRoutes;