const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// MySQL Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "MyNewPass@123",
    database: "student_management"
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

// Get All Students
app.get("/students", (req, res) => {
    db.query("SELECT * FROM students", (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
});

// Add Student
app.post("/students", (req, res) => {
    const { roll_no, name, email, phone, course, semester } = req.body;

    const sql = `INSERT INTO students
    (roll_no, name, email, phone, course, semester)
    VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(sql, [roll_no, name, email, phone, course, semester],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Student Added Successfully!" });
        }
    );
});

// Start Server
app.listen(5000, () => {
    console.log("Server running at http://localhost:5000");
});