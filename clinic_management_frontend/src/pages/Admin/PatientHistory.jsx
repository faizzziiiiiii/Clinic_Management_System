import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import API from "../../api/api";
import "./Admin.css";

export default function PatientHistory() {
  const [records, setRecords] = useState([]);

  const loadRecords = () => {
    API.get("admin/patient-history/")
      .then(res => setRecords(res.data))
      .catch(() => console.error("Failed to load history"));
  };

  useEffect(() => {
    loadRecords();
  }, []);

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="content-area">
        <TopBar />

        <div className="page-content">
          <h2 className="page-title">Patient History</h2>

          <table className="employees-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Appointment Date</th>
                <th>Doctor</th>
                <th>Department</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{r.patient_name}</td>

                  <td>{new Date(r.created_at).toLocaleString()}</td>

                  <td>{r.doctor_name}</td>

                  {/* Department fixed – now visible */}
                  <td>{r.department_name || "—"}</td>

                  <td>{r.status}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}
