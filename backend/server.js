
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "student_management",
    port: Number(process.env.DB_PORT) || 3306
});

db.connect((err) => {
    if (err) {
        console.log("Database Connection Failed:", err.message);
    } else {
        console.log("MySQL Database Connected Successfully!");
    }
});

// Home Route
app.get("/", (req, res) => {
    res.send("Student Management System Backend Running");
});

// Admin Login
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (
        username === process.env.ADMIN_USERNAME &&
        password === process.env.ADMIN_PASSWORD
    ) {
        return res.json({
            success: true,
            message: "Login Successful"
        });
    }

    res.status(401).json({
        success: false,
        message: "Invalid Username or Password"
    });
});

// Get All Students
app.get("/students", (req, res) => {
    db.query(
        "SELECT * FROM students ORDER BY id DESC",
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(result);
        }
    );
});

// Add Student
app.post("/students", (req, res) => {
    const { roll_no, name, email, phone, course, semester } = req.body;

    if (!roll_no || !name || !email || !phone || !course || !semester) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const sql = `INSERT INTO students
    (roll_no, name, email, phone, course, semester)
    VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(
        sql,
        [roll_no, name, email, phone, course, Number(semester)],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: err.code === "ER_DUP_ENTRY"
                        ? "Roll Number or Email already exists"
                        : err.message
                });
            }

            res.status(201).json({
                message: "Student Added Successfully!",
                id: result.insertId
            });
        }
    );
});

// Update Student
app.put("/students/:id", (req, res) => {
    const { roll_no, name, email, phone, course, semester } = req.body;

    if (!roll_no || !name || !email || !phone || !course || !semester) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const sql = `UPDATE students SET
    roll_no = ?, name = ?, email = ?,
    phone = ?, course = ?, semester = ?
    WHERE id = ?`;

    db.query(
        sql,
        [
            roll_no,
            name,
            email,
            phone,
            course,
            Number(semester),
            req.params.id
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: err.code === "ER_DUP_ENTRY"
                        ? "Roll Number or Email already exists"
                        : err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Student Not Found"
                });
            }

            res.json({
                message: "Student Updated Successfully!"
            });
        }
    );
});

// Delete Student
app.delete("/students/:id", (req, res) => {
    db.query(
        "DELETE FROM students WHERE id = ?",
        [req.params.id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Student Not Found"
                });
            }

            res.json({
                message: "Student Deleted Successfully!"
            });
        }
    );
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
