
import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("Dashboard");
  const [editId, setEditId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [search, setSearch] = useState("");

  // Load student records safely
  const [students, setStudents] = useState(() => {
    try {
      const savedStudents = localStorage.getItem("students");
      return savedStudents ? JSON.parse(savedStudents) : [];
    } catch {
      return [];
    }
  });

  // Student Form
  const [form, setForm] = useState({
    roll: "",
    name: "",
    email: "",
    phone: "",
    course: "",
    semester: ""
  });

  // Save students in Local Storage
  useEffect(() => {
    localStorage.setItem("students", JSON.stringify(students));
  }, [students]);

  // Dashboard Statistics
  const totalCourses = new Set(
    students.map(student => student.course).filter(Boolean)
  ).size;

  const totalSemesters = new Set(
    students.map(student => student.semester).filter(Boolean)
  ).size;

  // Login Function
  const handleLogin = (e) => {
    e.preventDefault();

    if (username === "admin" && password === "admin123") {
      setLoggedIn(true);
    } else {
      alert("Invalid Username or Password");
    }
  };

  // Reset Form
  const resetForm = () => {
    setForm({
      roll: "",
      name: "",
      email: "",
      phone: "",
      course: "",
      semester: ""
    });
    setEditId(null);
  };

  // Add and Update Student
  const addStudent = (e) => {
    e.preventDefault();

    if (editId === null) {
      const rollExists = students.some(
        student => student.roll === form.roll
      );

      if (rollExists) {
        alert("Roll Number already exists!");
        return;
      }

      setStudents([...students, { ...form, id: Date.now() }]);
      alert("Student Added Successfully!");
    } else {
      setStudents(students.map(student =>
        student.id === editId
          ? { ...form, id: editId }
          : student
      ));

      alert("Student Updated Successfully!");
    }

    resetForm();
    setPage("Students");
  };

  // Delete Student
  const deleteStudent = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      setStudents(students.filter(student => student.id !== id));

      if (selectedStudent && selectedStudent.id === id) {
        setSelectedStudent(null);
      }
    }
  };

  // Search Students
  const filteredStudents = students.filter(student =>
    String(student.name || "").toLowerCase().includes(search.toLowerCase()) ||
    String(student.roll || "").toLowerCase().includes(search.toLowerCase())
  );

  // Export Student Records to CSV
  const exportToCSV = () => {
    const headers = [
      "Roll Number",
      "Name",
      "Email",
      "Phone",
      "Course",
      "Semester"
    ];

    const rows = students.map(student => [
      student.roll,
      student.name,
      student.email,
      student.phone,
      student.course,
      student.semester
    ]);

    const csvContent = [headers, ...rows]
      .map(row =>
        row.map(value =>
          `"${String(value ?? "").replace(/"/g, '""')}"`
        ).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "Student_Records.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // Login Page
  if (!loggedIn) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>Admin Login</h1>
          <p>Student Management System</p>

          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="dashboard">

      {/* Sidebar */}
      <aside className="sidebar">
        <h2>SMS</h2>
        <h3>Admin Panel</h3>

        <button onClick={() => setPage("Dashboard")}>
          Dashboard
        </button>

        <button onClick={() => {
          resetForm();
          setPage("Add Student");
        }}>
          Add Student
        </button>

        <button onClick={() => setPage("Students")}>
          View Students
        </button>

        <button onClick={() => {
          setLoggedIn(false);
          setPassword("");
          setPage("Dashboard");
          resetForm();
        }}>
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">

        {/* Dashboard Page */}
        {page === "Dashboard" && (
          <>
            <header>
              <h1>Admin Dashboard</h1>
              <p>Welcome, Admin!</p>
            </header>

            <div className="cards">

              <div className="card">
                <h3>Total Students</h3>
                <h1>{students.length}</h1>
              </div>

              <div className="card">
                <h3>Total Courses</h3>
                <h1>{totalCourses}</h1>
              </div>

              <div className="card">
                <h3>Total Semesters</h3>
                <h1>{totalSemesters}</h1>
              </div>

              <div className="card">
                <h3>Admin</h3>
                <h1>1</h1>
              </div>

            </div>

            <div className="welcome-box">
              <h2>Welcome to Student Management System</h2>
              <p>Manage student records easily.</p>
            </div>
          </>
        )}

        {/* Add Student Page */}
        {page === "Add Student" && (
          <div className="welcome-box">
            <h2>{editId === null ? "Add New Student" : "Update Student"}</h2>

            <form onSubmit={addStudent} className="student-form">

              <input
                type="text"
                placeholder="Roll Number"
                value={form.roll}
                onChange={e => setForm({ ...form, roll: e.target.value })}
                required
              />

              <input
                type="text"
                placeholder="Student Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />

              <input
                type="tel"
                placeholder="Phone Number"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                required
              />

              <input
                type="text"
                placeholder="Course"
                value={form.course}
                onChange={e => setForm({ ...form, course: e.target.value })}
                required
              />

              <input
                type="number"
                min="1"
                placeholder="Semester"
                value={form.semester}
                onChange={e => setForm({ ...form, semester: e.target.value })}
                required
              />

              <button type="submit">
                {editId === null ? "Save Student" : "Update Student"}
              </button>

              <button type="button" onClick={resetForm}>
                Clear Form
              </button>

            </form>
          </div>
        )}

        {/* View Students Page */}
        {page === "Students" && (
          <div className="welcome-box">
            <h2>Student Records</h2>

            <button onClick={exportToCSV}>
              Export Student Records
            </button>

            <button onClick={() => window.print()}>
              Print Student Records
            </button>

            <input
              type="text"
              placeholder="Search by Name or Roll Number"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Roll No.</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Course</th>
                    <th>Semester</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map(student => (
                    <tr key={student.id}>
                      <td>{student.roll}</td>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.phone}</td>
                      <td>{student.course}</td>
                      <td>{student.semester}</td>

                      <td>
                        <button onClick={() => {
                          setForm({
                            roll: student.roll,
                            name: student.name,
                            email: student.email,
                            phone: student.phone,
                            course: student.course,
                            semester: student.semester
                          });

                          setEditId(student.id);
                          setPage("Add Student");
                        }}>
                          Edit
                        </button>

                        <button onClick={() => deleteStudent(student.id)}>
                          Delete
                        </button>

                        <button onClick={() => setSelectedStudent(student)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredStudents.length === 0 && (
              <p>No Student Records Found</p>
            )}
          </div>
        )}

        {/* Student Details */}
        {selectedStudent && (
          <div className="welcome-box">
            <h2>Student Full Details</h2>

            <p><b>Roll Number:</b> {selectedStudent.roll}</p>
            <p><b>Name:</b> {selectedStudent.name}</p>
            <p><b>Email:</b> {selectedStudent.email}</p>
            <p><b>Phone:</b> {selectedStudent.phone}</p>
            <p><b>Course:</b> {selectedStudent.course}</p>
            <p><b>Semester:</b> {selectedStudent.semester}</p>

            <button onClick={() => setSelectedStudent(null)}>
              Close Details
            </button>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
