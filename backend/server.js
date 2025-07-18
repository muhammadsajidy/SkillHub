import e from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import evaluationRoutes from "./routes/evaluationRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

const app = e();
const PORT = 3000;
app.use((cors({
    origin: 'https://skillhub-2rem.onrender.com', 
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
})));

app.use(e.json());
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => {
    res.send("Server is running!");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
