import pool from "../db/index.js";

export async function getQuarterWiseAverageScore(req, res) {
    const { year } = req.query

    try {
        const result = await pool.query(
            `SELECT ROUND(AVG(score), 1) AS average_score, quarter, year 
            FROM SkillEvaluation 
            WHERE year = $1
            GROUP BY quarter, year 
            ORDER BY quarter;`,
            [year]
        );

        return res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching data" });
    };
};

export async function getAverageScoreByDepartment(req, res) {
    try {
        const result = await pool.query(
            `SELECT d.dept_name, ROUND(AVG(se.score), 1) average_score
            FROM Department d
            JOIN Employee e ON d.dept_id = e.dept_id
            JOIN SkillEvaluation se on e.emp_id = se.emp_id
            GROUP BY d.dept_name;`
        );

        return res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error fetching data" });
    };
};

export async function getSkillLevelWiseDistribution(req, res) {
    try {
        const result = await pool.query(
            `SELECT 
            skill_level, 
            COUNT(*) AS count
            FROM SkillEvaluation
            GROUP BY skill_level;`
        );

        return res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error fetching data" });
    };
};

export async function getTopPerformers(req, res) {
    try {
        const result = await pool.query(
            `SELECT DISTINCT e.emp_name, d.dept_name, se.score, se.max_score
            FROM Employee e
            JOIN Department d ON e.dept_id = d.dept_id
            JOIN SkillEvaluation se ON e.emp_id = se.emp_id
            ORDER BY se.score DESC LIMIT 5;`
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "No results found" });
        };

        return res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error fetching data" });
    };
};