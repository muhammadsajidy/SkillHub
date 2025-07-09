import { Router } from "express";
import { getAllDepartments, getDepartmentDetails } from "../controllers/departmentController.js";
import authenticateToken from "../middleware/authMiddleware.js";

const departmentRoutes = Router();

departmentRoutes.get("/all", authenticateToken, getAllDepartments);
departmentRoutes.get("/details", authenticateToken, getDepartmentDetails);

export default departmentRoutes;