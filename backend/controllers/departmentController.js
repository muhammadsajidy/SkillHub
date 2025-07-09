import pool from  "../db/index.js";

export async function getAllDepartments(preq, res) {
    try {
        const result = await pool.query(
            "SELECT dept_name FROM Department;"
        );

        return res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error fetching data" });
    };
};

export async function getDepartmentDetails(req, res) {
    try {
        const result = await pool.query(
            `SELECT d.*, ROUND(AVG(se.score), 1) average_score, se.max_score, COUNT(DISTINCT emp_name) emp_count
            FROM Department d 
            JOIN Employee e ON d.dept_id = e.dept_id
            JOIN SkillEvaluation se ON e.emp_id = se.emp_id
            GROUP BY d.dept_name, d.dept_id, se.max_score
            ORDER BY d.dept_id;`
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "No result found" });
        };

        return res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error fetching data" });
    };
};