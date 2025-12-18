import { useEffect, useState } from "react";
import API from "../../api/api";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import "./Admin.css";

export default function AddDepartment() {
  const [departments, setDepartments] = useState([]);
  const [newDept, setNewDept] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [filterDept, setFilterDept] = useState("ALL");

  const loadDepartments = () => {
    API.get("admin/departments/")
      .then((res) => {
        const sorted = res.data.sort((a, b) => a.id - b.id);
        setDepartments(sorted);
      })
      .catch(() => console.error("Failed fetching departments"));
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const addDepartment = async () => {
    if (!newDept.trim()) {
      alert("Enter a department name");
      return;
    }

    if (departments.some((d) => d.name.toLowerCase() === newDept.toLowerCase())) {
      alert("Department already exists!");
      return;
    }

    await API.post("admin/departments/", { name: newDept });
    setNewDept("");
    loadDepartments();
  };

  const saveEdit = async () => {
    await API.put(`admin/departments/${editId}/`, { name: editName });
    setEditId(null);
    loadDepartments();
  };

  const deleteDepartment = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    await API.delete(`admin/departments/${id}/`);
    loadDepartments();
  };

  const filteredDepartments =
    filterDept === "ALL"
      ? departments
      : departments.filter((d) => d.name === filterDept);

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="content-area">
        <TopBar />
        <div className="page-content">

          <h2 className="page-title">Manage Departments</h2>

          {/* 2 Column Layout */}
          <div className="dept-container">

            {/* LEFT SIDE - Add New */}
            <div className="dept-left">
              <h3>Add New Department</h3>

              <input
                className="dept-input"
                placeholder="Enter Department Name"
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
              />

              <button className="btn-submit" onClick={addDepartment}>
                Add Department
              </button>
            </div>

            {/* RIGHT SIDE - List */}
            <div className="dept-right">

              <div className="dept-filter-box">
                <select
                  className="filter-select"
                  onChange={(e) => setFilterDept(e.target.value)}
                >
                  <option value="ALL">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <table className="employees-table" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Department Name</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDepartments.map((dept) => (
                    <tr key={dept.id}>
                      <td>{dept.id}</td>

                      <td>
                        {editId === dept.id ? (
                          <input
                            className="dept-input"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                          />
                        ) : (
                          dept.name
                        )}
                      </td>

                      <td style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        {editId === dept.id ? (
                          <button className="btn-edit" onClick={saveEdit}>Save</button>
                        ) : (
                          <button
                            className="btn-edit"
                            onClick={() => {
                              setEditId(dept.id);
                              setEditName(dept.name);
                            }}
                          >
                            Edit
                          </button>
                        )}

                        <button
                          className="btn-danger"
                          onClick={() => deleteDepartment(dept.id)}
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
    </div>
  );
}
