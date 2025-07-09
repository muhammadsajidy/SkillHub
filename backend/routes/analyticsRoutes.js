import { Router } from "express";
import { getQuarterWiseAverageScore, getAverageScoreByDepartment, getSkillLevelWiseDistribution, getTopPerformers } from "../controllers/analyticsController.js";
import authenticateToken from "../middleware/authMiddleware.js";

const analyticsRoutes = Router();

analyticsRoutes.get("/quarter-wise", authenticateToken, getQuarterWiseAverageScore);
analyticsRoutes.get("/department-wise", authenticateToken, getAverageScoreByDepartment);
analyticsRoutes.get("/skilllevel-wise", authenticateToken, getSkillLevelWiseDistribution);
analyticsRoutes.get("/top-performers", authenticateToken, getTopPerformers);

export default analyticsRoutes;