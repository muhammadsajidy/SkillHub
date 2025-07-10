import { Router } from "express";
import { getAllDepartments, getDepartmentDetails, addDepartmentDetails } from "../controllers/departmentController.js";
import authenticateToken from "../middleware/authMiddleware.js";

const departmentRoutes = Router();

departmentRoutes.get("/all", authenticateToken, getAllDepartments);
departmentRoutes.get("/details", authenticateToken, getDepartmentDetails);
departmentRoutes.post("/add", authenticateToken, addDepartmentDetails);

export default departmentRoutes;