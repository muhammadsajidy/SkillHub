import pool from  "../db/index.js";

export async function getSkillEvaluation(req, res) {
    const { limit, offset, sortBy = 'year', order = 'asc' } = req.query;

    const allowedSortBy = ['score', 'quarter', 'year'];
    const allowedOrder = ['asc', 'desc'];

    const sortColumn = allowedSortBy.includes(sortBy) ? sortBy : 'year';
    const sortOrder = allowedOrder.includes(order.toLowerCase()) ? order.toUpperCase() : 'ASC';

    try {
        const query = `
            SELECT 
                se.eval_id, e.emp_name, d.dept_name, s.skill_name, se.skill_level, se.score, se.max_score, se.quarter, se.year
            FROM
                Employee e
            JOIN
                Department d ON e.dept_id = d.dept_id
            JOIN
                SkillEvaluation se ON e.emp_id = se.emp_id
            JOIN
                Skill s ON se.skill_id = s.skill_id
            ORDER BY se.${sortColumn} ${sortOrder} 
            LIMIT $1 OFFSET $2;
        `;

        const result = await pool.query(query, [limit, offset]);

        const totalRows = await pool.query("SELECT COUNT(*) FROM SkillEvaluation;");

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "No results available" });
        };

        return res.status(200).json({ result: result.rows, dataSize: totalRows.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching data" });
    }
};

export async function searchSkillEvaluation(req, res) {
    const { empId, department, skill  } = req.query;

    let query = `
    SELECT 
        se.eval_id, e.emp_name, d.dept_name, s.skill_name, se.score, se.max_score, se.quarter, se.year, se.comment, se.eval_id, se.skill_level
    FROM
        Employee e
    JOIN
        Department d ON e.dept_id = d.dept_id
    JOIN
        SkillEvaluation se ON e.emp_id = se.emp_id
    JOIN
        Skill s ON se.skill_id = s.skill_id
    WHERE 1=1
    `;

    const values = [];

    if (empId) {
        query += ` AND e.emp_id = $${values.length + 1}`;
        values.push(empId);
    };
    if (department) {
        query += ` AND LOWER(d.dept_name) = LOWER($${values.length + 1})`;
        values.push(department);
    };
    if (skill) {
        query += ` AND LOWER(s.skill_name) = LOWER($${values.length + 1})`;
        values.push(skill);
    };
    
    try {
        const result = await pool.query(query, values);

        if (result.rowCount === 0) return res.status(404).json({ message: "No results found" });

        return res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database Error" });
    };
};

export async function addSkillEvaluation(req, res) {
  const { empId, skillId } = req.query;
  const { score, quarter, year, comment } = req.body;

  let skillLevel = null;
  if (score >= 0 && score <= 3) skillLevel = "Beginner";
  else if (score >= 4 && score <= 6) skillLevel = "Intermediate";
  else if (score >= 7 && score <= 8) skillLevel = "Advanced";
  else if (score >= 9 && score <= 10) skillLevel = "Expert";

  try {
    await pool.query(
      `INSERT INTO SkillEvaluation (emp_id, skill_id, score, quarter, year, comment, skill_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [empId, skillId, score, quarter, year, comment, skillLevel]
    );

    return res.status(200).json({ message: "Successfully inserted the data" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Database Error" });
  }
};

export async function updateSkillEvaluation(req, res) {
  const { evalId } = req.params; 
  const { score, quarter, year, comment } = req.body;
  const commentValue = comment ?? null;

  try {
    const result = await pool.query(
      `UPDATE SkillEvaluation
       SET score = $1,
           quarter = $2,
           year = $3,
           comment = $4
       WHERE eval_id = $5`,
      [score, quarter, year, commentValue, parseInt(evalId, 10)]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "No matching evaluation found" });
    }

    return res.status(200).json({ message: "Evaluation updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database Error" });
  }
};

export async function removeSkillEvaluation(req, res) {
    const { evalId } = req.params;

    try {
        await pool.query(
            `DELETE FROM SkillEvaluation 
            WHERE eval_id = $1;`,
            [evalId]
        );

        return res.status(200).json({ message: "Successfully deleted the skill evaluation" })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database Error" });
    };
};

export async function getEvaluationYears(req, res) {
  try {
    const result = await pool.query(`SELECT DISTINCT year FROM SkillEvaluation ORDER BY year DESC`);
    const years = result.rows.map(row => row.year); // keep as integers
    res.status(200).json(years);
  } catch (error) {
    console.error("Error fetching years:", error);
    res.status(500).json({ error: "Database error" });
  }
};