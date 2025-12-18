// src/pages/Admin/EditEmployee.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import "./Admin.css";

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    contact_number: "",
    gender: "",
    age: "",
    role: "",
    department: ""
  });

  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    loadEmployee();
    loadDepartments();
  }, []);

  const loadEmployee = async () => {
    try {
      const res = await API.get(`admin/employees/${id}/`);
      setForm(res.data);
    } catch {
      alert("Failed to load employee!");
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await API.get("admin/departments/");
      setDepartments(res.data);
    } catch {}
  };

  // Validation on save
  const validate = () => {
    if (!/^[A-Za-z ]+$/.test(form.first_name)) return alert("Invalid First Name");
    if (form.last_name && !/^[A-Za-z ]+$/.test(form.last_name)) return alert("Invalid Last Name");
    if (form.contact_number.length !== 10) return alert("Contact must be 10 digits");
    if (form.age < 18) return alert("Age must be 18+");
    return true;
  };

  const updateEmployee = async () => {
    if (!validate()) return;
    try {
      await API.put(`admin/employees/${id}/`, form);
      alert("Employee updated!");
      navigate("/admin/employees");
    } catch {
      alert("Failed to update!");
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="content-area">
        <TopBar />

        <div className="page-content">
          <h2 className="page-title">Edit Employee</h2>

          <div className="add-employee-form">

            <div className="form-row">
              <input
                placeholder="First Name"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                required
              />
              <input
                placeholder="Last Name"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />
            </div>

            <div className="form-row">
              <input
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />

              <input
                placeholder="Contact Number"
                value={form.contact_number}
                onChange={(e) =>
                  setForm({ ...form, contact_number: e.target.value })
                }
                required
              />
            </div>

            <div className="form-row">
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
              </select>

              <input
                placeholder="Age"
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
            </div>

            <div className="form-row">
              <select
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

              {form.role === "DOCTOR" && (
                <select
                  value={form.department || ""}
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
              )}
            </div>

            <button className="btn-submit" onClick={updateEmployee}>
              Save Changes
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
