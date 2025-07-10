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

export async function getEmployeeGrowth(req, res) {
  const empId = parseInt(req.params.empId);
  const year = req.query.year ? parseInt(req.query.year) : null;
  const skillId = req.query.skill_id ? parseInt(req.query.skill_id) : null;

  try {
    const employeeResult = await pool.query(
      `SELECT date_of_joining date_joined FROM Employee WHERE emp_id = $1`,
      [empId]
    );
    const dateJoined = employeeResult.rows[0]?.date_joined;
    if (!dateJoined) throw new Error("Employee not found");

    const startYear = dateJoined.getFullYear();
    const startMonth = dateJoined.getMonth() + 1; 
    const startQuarter = Math.ceil(startMonth / 3);

    let query = `
      SELECT
        se.skill_id,
        s.skill_name,
        se.score,
        se.max_score,
        se.quarter,
        se.year
      FROM SkillEvaluation se
      JOIN Skill s ON se.skill_id = s.skill_id
      WHERE se.emp_id = $1
    `;
    const params = [empId];

    if (year) {
      query += ` AND se.year = $2`;
      params.push(year);
    } else {
      query += ` AND se.year >= $2`;
      params.push(startYear);
    };

    if (skillId) {
      query += ` AND se.skill_id = $3`;
      params.push(skillId);
    } else {
      const skillResult = await pool.query(
        `SELECT skill_id FROM SkillEvaluation WHERE emp_id = $1 LIMIT 1`,
        [empId]
      );
      const randomSkillId = skillResult.rows[0]?.skill_id;
      if (randomSkillId) {
        query += ` AND se.skill_id = $3`;
        params.push(randomSkillId);
      } else {
        return res.status(404).json({ message: "No skills found for employee" });
      }
    };

    query += ` ORDER BY se.year, se.quarter`;

    const result = await pool.query(query, params);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching employee growth:", error);
    res.status(500).json({ message: "Server error" });
  };
};

export async function getSkillGraph(req, res) {
  const skillId = parseInt(req.params.skillId);
  const year = req.query.year ? parseInt(req.query.year) : null;
  const quarter = req.query.quarter ? req.query.quarter : null;

  try {
    let query = `
      SELECT AVG(se.score) as average_score
      FROM SkillEvaluation se
      JOIN Employee e ON se.emp_id = e.emp_id
      WHERE se.skill_id = $1
    `;
    const params = [skillId];

    if (year) {
      query += ` AND se.year = $2`;
      params.push(year);
    }
    if (quarter) {
      query += ` AND se.quarter = $3`;
      params.push(quarter);
    }

    const result = await pool.query(query, params);
    const averageScore = result.rows[0]?.average_score || 0;

    res.status(200).json({ average_score: parseFloat(averageScore.toFixed(2)) });
  } catch (error) {
    console.error("Error fetching skill average:", error);
    res.status(500).json({ message: "Server error" });
  }
};