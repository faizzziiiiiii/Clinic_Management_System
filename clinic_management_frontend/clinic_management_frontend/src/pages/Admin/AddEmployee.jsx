import { useEffect, useState } from "react";
import API from "../../api/api";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import "./Admin.css";

export default function AddEmployee() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    contact_number: "",
    gender: "",
    age: "",
    role: "",
    department: "",
  });

  const [departments, setDepartments] = useState([]);
  const [generated, setGenerated] = useState(null);

  // Department API
  useEffect(() => {
    API.get("admin/departments/")
      .then((res) => setDepartments(res.data))
      .catch(() => console.error("Failed to load Dept"));
  }, []);

  // Validation Rules
  const validateForm = () => {
    if (!/^[A-Za-z ]+$/.test(form.full_name)) {
      alert("Name should contain only alphabets");
      return false;
    }
    if (!/^[0-9]{10}$/.test(form.contact_number)) {
      alert("Contact number must be 10 digits");
      return false;
    }
    if (form.age < 18 || form.age > 70) {
      alert("Enter a valid age (18–70)");
      return false;
    }
    if (form.role === "DOCTOR" && !form.department) {
      alert("Doctor must have a Department assigned");
      return false;
    }
    return true;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const res = await API.post("admin/employees/", form);
      setGenerated(res.data);
      alert("Employee Added!");
      setForm({
        full_name: "",
        email: "",
        contact_number: "",
        gender: "",
        age: "",
        role: "",
        department: "",
      });
    } catch {
      alert("Failed to Add Employee!");
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="content-area">
        <TopBar />

        <div className="page-content-center">
          <h2 className="page-title">Add Employee</h2>

          <form className="add-employee-form" onSubmit={handleSubmit}>

            <div className="form-row">
              <div>
                <label>Full Name</label>
                <input
                  required
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({ ...form, full_name: e.target.value })
                  }
                />
              </div>

              <div>
                <label>Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-row">
              <div>
                <label>Contact Number</label>
                <input
                  required
                  value={form.contact_number}
                  onChange={(e) =>
                    setForm({ ...form, contact_number: e.target.value })
                  }
                  maxLength="10"
                />
              </div>

              <div>
                <label>Gender</label>
                <select
                  required
                  value={form.gender}
                  onChange={(e) =>
                    setForm({ ...form, gender: e.target.value })
                  }
                >
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>

                  

                </select>
              </div>
            </div>

            <div className="form-row">
              <div>
                <label>Age</label>
                <input
                  required
                  type="number"
                  value={form.age}
                  onChange={(e) =>
                    setForm({ ...form, age: e.target.value })
                  }
                />
              </div>

              <div>
                <label>Role</label>
                <select
                  required
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value, department: "" })
                  }
                >
                  <option value="">Select Role</option>
                  <option value="RECEPTIONIST">Receptionist</option>
                  <option value="DOCTOR">Doctor</option>
                  <option value="PHARMACIST">Pharmacist</option>
                  <option value="LAB_TECHNICIAN">Lab Technician</option>
                </select>
              </div>
            </div>

            {/* SHOW ONLY IF ROLE = DOCTOR */}
            {form.role === "DOCTOR" && (
              <div>
                <label>Department</label>
                <select
                  required
                  value={form.department}
                  onChange={(e) =>
                    setForm({ ...form, department: e.target.value })
                  }
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button className="btn-submit" type="submit">
              Add Employee
            </button>
          </form>

          {generated && (
            <div className="credentials-box">
              <h3>Generated Credentials</h3>
              <p>
                Username: <strong>{generated.generated_username}</strong>
              </p>
              <p>
                Password: <strong>{generated.generated_password}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
