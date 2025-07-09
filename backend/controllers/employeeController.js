import pool from  "../db/index.js";

export async function getAllEmployees(req, res) {
    try {
        const result = await pool.query(
            `SELECT * FROM Employee;`
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching data" });
    };
};

export async function getOneEmployee(req, res) {
    const { empName = "", limit = 10, offset = 0 } = req.query;

    try {
        const result = await pool.query(
            `SELECT e.emp_name, d.dept_name, s.skill_name, se.score, se.year, se.quarter, se.skill_level
            FROM Employee e
            JOIN Department d ON e.dept_id = d.dept_id
            JOIN SkillEvaluation se ON e.emp_id = se.emp_id
            JOIN Skill s ON se.skill_id = s.skill_id
            WHERE e.emp_name ILIKE $1
            ORDER BY s.skill_name
            LIMIT $2 OFFSET $3;`,
            [`%${empName}%`, limit, offset]
        );

        res.status(200).json({ result: result.rows, dataSize: [{ count: result.rowCount }] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching data" });
    };
};

export async function getRecentEmployeeAssessments(req, res) {
  try {
    const result = await pool.query(
      `SELECT e.emp_name, s.skill_name, se.score
      FROM Employee e 
      JOIN Department d ON e.dept_id = d.dept_id
      JOIN SkillEvaluation se ON e.emp_id = se.emp_id
      JOIN Skill s ON se.skill_id = s.skill_id
      WHERE se.eval_id IN (
          SELECT MAX(eval_id)
          FROM SkillEvaluation
          GROUP BY emp_id
          ORDER BY MAX(eval_id) DESC
          LIMIT 4
      )
      ORDER BY se.eval_id DESC;`
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching data" });
  };
};

export async function getImportantEmployeeDetails(req, res) {
    try {
        const result = await pool.query(
            `SELECT 
                e.emp_name,
                d.dept_name,
                ARRAY_AGG(DISTINCT s.skill_name) AS skills,
                ROUND(AVG((se.score * 10.0) / se.max_score), 2) AS average_score,
                ROUND(MAX((se.score * 10.0) / se.max_score), 2) AS high_score
            FROM 
                Employee e
            JOIN 
                Department d ON e.dept_id = d.dept_id
            JOIN 
                SkillEvaluation se ON e.emp_id = se.emp_id
            JOIN 
                Skill s ON se.skill_id = s.skill_id
            GROUP BY 
                e.emp_id, e.emp_name, d.dept_name
            ORDER BY 
                e.emp_name;`
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "No results found" });
        };

        return res.status(200).json(result.rows)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching data" });
    };
};