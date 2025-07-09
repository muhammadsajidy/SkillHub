import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from  "../db/index.js";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || "1h";

export async function register(req, res) {
    const { username, password, emailId, role } = req.body;
    
    if (!username || !password || !emailId) {
        return res.status(400).json({ message: "Username and password are required" });
    };

    try {
        const existingUser = await pool.query(
            "SELECT * FROM Users WHERE username = $1",
            [username]
        );
        if (existingUser.rowCount) {
            return res.status(400).json({ message: "Username already exists" });
        };

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            "INSERT INTO Users (username, password, email_id, role) VALUES ($1, $2, $3, $4)",
            [username, hashedPassword, emailId, role]
        );

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal server error" });
    };
};

export async function login(req, res) {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    };

    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE username = $1",
            [username]
        );
        if (!result.rowCount) {
            return res.status(401).json({ error: "Invalid Credentials" });
        };
        const user = result.rows[0];

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid Credentials" });
        };

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    };
};