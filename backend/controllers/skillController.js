import pool from  "../db/index.js";

export async function getAllSkills(req, res) {
    try {
        const result = await pool.query(
            `SELECT 
                s.skill_id,
                s.skill_name,
                COALESCE(sc.category_name, 'Uncategorized') AS skill_category,
                COUNT(DISTINCT se.emp_id) AS employee_count
            FROM Skill s
            LEFT JOIN Skill_Category sc ON s.category_id = sc.category_id
            LEFT JOIN SkillEvaluation se ON s.skill_id = se.skill_id
            GROUP BY s.skill_id, s.skill_name, sc.category_name
            ORDER BY skill_category, s.skill_name;`
        );

        if (result.rowCount === 0) {
            return res.status(204).json({ message: "Result set is empty" });
        };

        return res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching data" });
    };
};

export async function addSkill(req, res) {
    const { skillName, skillCategory } = req.body;

    if (!skillName || !skillCategory) {
        return res.status(400).json({ message: "Skill name and category name are required." });
    }

    let client;
    try {
        client = await pool.connect();

        const categoryResult = await client.query(
            `SELECT category_id FROM skill_category WHERE category_name = $1;`,
            [skillCategory]
        );

        let categoryId;
        if (categoryResult.rows.length > 0) {
            categoryId = categoryResult.rows[0].category_id;
        } else {
            const newCategoryResult = await client.query(
                `INSERT INTO skill_category (category_name) VALUES ($1) RETURNING category_id;`,
                [skillCategory]
            );
            categoryId = newCategoryResult.rows[0].category_id;
        }

        const skillInsertResult = await client.query(
            `INSERT INTO Skill (skill_name, category_id)
            VALUES ($1, $2)
            ON CONFLICT (skill_name) DO NOTHING
            RETURNING skill_id;`,
            [skillName, categoryId]
        );

        if (skillInsertResult.rowCount > 0) {
            return res.status(201).json({
                message: "Skill added successfully",
                skill_id: skillInsertResult.rows[0].skill_id,
                category_id: categoryId
            });
        } else {
            return res.status(200).json({ message: "Skill already exists." });
        }
    } catch (error) {
        console.error("Error adding skill:", error);
        res.status(500).json({ message: "Unable to add skill due to a server error." });
    } finally {
        if (client) {
            client.release();
        };
    };
};

export async function removeSkill(req, res) {
    const { skillId } = req.params;  

    const parsedSkillId = parseInt(skillId, 10);

    if (isNaN(parsedSkillId)) {
        return res.status(400).json({ message: "Invalid skill ID" });
    };

    try {
        const result = await pool.query(
            `DELETE FROM Skill WHERE skill_id = $1;`,
            [parsedSkillId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Skill not found" });
        };

        return res.status(200).json({ message: "Skill deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unable to remove skill" });
    };
};

export async function editSkillLevel(req, res) {
    const { skillId } = req.params;
    const { max_score } = req.body;

    if (!skillId || !max_score || isNaN(max_score) || max_score <= 0) {
        return res.status(400).json({ message: "Invalid skillId or max_score. max_score must be a positive number." });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const result = await client.query(
            `UPDATE SkillEvaluation
             SET 
                 score = CASE 
                     WHEN max_score > 0 THEN (score::float / max_score) * $1
                     ELSE score
                 END,
                 max_score = $1
             WHERE skill_id = $2
             RETURNING *;`,
            [max_score, skillId]
        );

        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "No evaluations found for the specified skillId." });
        }

        await client.query('COMMIT');

        return res.status(200).json({ message: "Skill level updated successfully" });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        return res.status(500).json({ message: "Unable to update skill level" });
    } finally {
        client.release();
    }
};

export async function getAvgSkillScore(req, res) {
    try {
        const result = await pool.query(
            `SELECT 
                ROUND(AVG((se.score * 10.0) / se.max_score), 1) AS average_score,
                ROUND(MAX((se.score * 10.0) / se.max_score), 0) AS high_score
            FROM 
                SkillEvaluation se;`
        );

        return res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unable to fetch data" });
    };
};

export async function getEmployeeSkills(req, res) {
    const { empId } = req.query;

    try {
        const result = await pool.query(
            `SELECT 
                s.skill_id, s.skill_name
            FROM SkillEvaluation se
            JOIN Skill s ON se.skill_id = s.skill_id
            WHERE se.emp_id = $1
            GROUP BY s.skill_id, s.skill_name
            ORDER BY s.skill_name;`,
            [empId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "No results available" });
        };

        return res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unable to fetch data" });
    };
};