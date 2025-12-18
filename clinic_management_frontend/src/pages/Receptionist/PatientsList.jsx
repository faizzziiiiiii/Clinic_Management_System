// src/pages/Receptionist/PatientsList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import API from "../../api/api";
import "../Receptionist/Recep.css";

export default function PatientsList() {
  const [patients, setPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchPatients = async () => {
    try {
      // ✅ NO leading slash
      const response = await API.get("receptionist/patients/");
      setPatients(response.data);
      setAllPatients(response.data);
    } catch (err) {
      console.error("Error loading patients:", err);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearch(keyword);

    setPatients(
      allPatients.filter(
        (p) =>
          p.full_name.toLowerCase().includes(keyword) ||
          p.patient_id.toLowerCase().includes(keyword)
      )
    );
  };

  const deletePatient = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;

    try {
      // ✅ NO leading slash
      await API.delete(`receptionist/patients/${id}/`);
      fetchPatients();
      alert("Patient deleted successfully!");
    } catch (err) {
      console.error("Delete Failed", err);
      alert("Failed to delete patient");
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="content-area">
        <TopBar />

        <div className="page-content">
          <h2 className="page-title">Patients List</h2>

          <input
            className="search-input"
            type="text"
            placeholder="Search by Name or Patient ID"
            value={search}
            onChange={handleSearch}
          />

          <table className="patients-table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {patients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">
                    No Patients Found
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.id}>
                    <td>{p.patient_id}</td>
                    <td>{p.full_name}</td>
                    <td>{p.age}</td>
                    <td>{p.contact_number}</td>
                    <td className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() =>
                          navigate(`/receptionist/edit-patient/${p.id}`)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="btn-delete"
                        onClick={() => deletePatient(p.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
