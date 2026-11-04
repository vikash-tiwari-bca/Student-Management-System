
import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("Dashboard");
  const [students, setStudents] = useState([]);
  const [editId, setEditId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    roll: "",
    name: "",
    email: "",
    phone: "",
    course: "",
    semester: ""
  });

  // Fetch Students from MySQL Backend
  const fetchStudents = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/students`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to fetch students");
      }

      setStudents(data);
    } catch (error) {
      alert("Error loading students: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load students after login
  useEffect(() => {
    if (loggedIn) {
      fetchStudents();
    }
  }, [loggedIn]);

  // Login Function
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid Login");
      }

      setLoggedIn(true);
      setPassword("");
    } catch (error) {
      alert(error.message);
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
  const addStudent = async (e) => {
    e.preventDefault();

    const studentData = {
      roll_no: form.roll.trim(),
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      course: form.course.trim(),
      semester: Number(form.semester)
    };

    try {
      const url = editId === null
        ? `${API_URL}/students`
        : `${API_URL}/students/${editId}`;

      const response = await fetch(url, {
        method: editId === null ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(studentData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Operation failed");
      }

      alert(data.message);

      resetForm();
      await fetchStudents();
      setPage("Students");

    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  // Delete Student
  const deleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/students/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Delete failed");
      }

      alert(data.message);

      if (selectedStudent && selectedStudent.id === id) {
        setSelectedStudent(null);
      }

      await fetchStudents();

    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  // Search Students
  const filteredStudents = students.filter(student =>
    String(student.name || "").toLowerCase().includes(search.toLowerCase()) ||
    String(student.roll_no || "").toLowerCase().includes(search.toLowerCase())
  );

  // Dashboard Statistics
  const totalCourses = new Set(
    students.map(student => student.course).filter(Boolean)
  ).size;

  const totalSemesters = new Set(
    students.map(student => student.semester).filter(Boolean)
  ).size;

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
      student.roll_no,
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
          setUsername("");
          setPage("Dashboard");
          setSelectedStudent(null);
          setSearch("");
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
              <button onClick={fetchStudents}>
                Refresh Dashboard
              </button>
            </div>
          </>
        )}

        {/* Add Student Page */}
        {page === "Add Student" && (
          <div className="welcome-box">
            <h2>
              {editId === null ? "Add New Student" : "Update Student"}
            </h2>

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

            {loading && <p>Loading students...</p>}

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
                      <td>{student.roll_no}</td>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.phone}</td>
                      <td>{student.course}</td>
                      <td>{student.semester}</td>

                      <td>
                        <button onClick={() => {
                          setForm({
                            roll: student.roll_no,
                            name: student.name,
                            email: student.email,
                            phone: student.phone,
                            course: student.course,
                            semester: String(student.semester)
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

            {!loading && filteredStudents.length === 0 && (
              <p>No Student Records Found</p>
            )}
          </div>
        )}

        {/* Student Details */}
        {selectedStudent && (
          <div className="welcome-box">
            <h2>Student Full Details</h2>

            <p><b>Roll Number:</b> {selectedStudent.roll_no}</p>
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
