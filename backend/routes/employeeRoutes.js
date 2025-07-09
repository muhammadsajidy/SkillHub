import { Router } from "express";
import { getAllEmployees, getOneEmployee, getRecentEmployeeAssessments, getImportantEmployeeDetails } from "../controllers/employeeController.js";
import authenticateToken from "../middleware/authMiddleware.js";

const employeeRouter = Router();

employeeRouter.get("/all", authenticateToken, getAllEmployees);
employeeRouter.get("/search", authenticateToken, getOneEmployee);
employeeRouter.get("/recent", authenticateToken, getRecentEmployeeAssessments);
employeeRouter.get("/main", authenticateToken, getImportantEmployeeDetails);

export default employeeRouter;