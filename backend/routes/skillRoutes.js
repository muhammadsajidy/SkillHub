import { Router } from "express";
import { getAllSkills, addSkill, removeSkill, editSkillLevel, getAvgSkillScore, getEmployeeSkills } from "../controllers/skillController.js";
import authenticateToken from "../middleware/authMiddleware.js";

const skillRoutes = Router();

skillRoutes.get("/all", authenticateToken, getAllSkills);
skillRoutes.post("/add", authenticateToken, addSkill);
skillRoutes.get("/average", authenticateToken, getAvgSkillScore);
skillRoutes.get("/employee-skills", authenticateToken, getEmployeeSkills);
skillRoutes.delete("/remove/:skillId", authenticateToken, removeSkill);
skillRoutes.put("/edit/:skillId", authenticateToken, editSkillLevel);

export default skillRoutes;