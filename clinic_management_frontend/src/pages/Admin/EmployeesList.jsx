import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import "./Admin.css";

export default function EmployeesList() {
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();
  const [allEmployees, setAllEmployees] = useState([]);

  const loadEmployees = async () => {
    try {
      const res = await API.get("admin/employees/");
      setEmployees(res.data);
      setAllEmployees(res.data);
    } catch (error) {
      console.error("Failed to fetch employees");
    }
  };

  const deleteEmployee = async (id) => {
    if (!window.confirm("Are you sure to remove this employee?")) return;
    try {
      await API.delete(`admin/employees/${id}/`);
      loadEmployees();
    } catch {
      alert("Delete failed!");
    }
  };

  const filterByRole = (role) => {
    if (role === "ALL") {
      setEmployees(allEmployees);
    } else {
      setEmployees(allEmployees.filter((emp) => emp.role === role));
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="content-area">
        <TopBar />

        <div className="page-content">

          <div className="employee-header">
            <h2 className="page-title">Employees List</h2>

            <select className="filter-select" onChange={(e) => filterByRole(e.target.value)}>
              <option value="ALL">All Roles</option>
              <option value="DOCTOR">Doctor</option>
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="PHARMACIST">Pharmacist</option>
              <option value="LAB_TECHNICIAN">Lab Technician</option>
            </select>
          </div>

          <div className="table-wrapper">
            <table className="employees-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th style={{ textAlign: "center" }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.first_name} {emp.last_name}</td>
                    <td>{emp.username}</td>

                    <td>
                      <span className={`role-badge role-${emp.role}`}>
                        {emp.role}
                      </span>
                    </td>

                    <td>{emp.department_name || "-"}</td>
                    <td>{emp.contact_number}</td>
                    <td>{emp.email}</td>

                    <td className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => navigate(`/admin/edit-employee/${emp.id}`)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn-danger"
                        onClick={() => deleteEmployee(emp.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
