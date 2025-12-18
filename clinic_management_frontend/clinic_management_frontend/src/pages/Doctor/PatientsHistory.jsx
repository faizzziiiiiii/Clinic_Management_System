// src/pages/Doctor/PatientsHistory.jsx
import { useEffect, useState } from "react";
import API from "../../api/api";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import { Link } from "react-router-dom";

export default function PatientsHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    API.get("/doctor/consultations/")
      .then((res) => setHistory(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="main-container">
      <Sidebar role="doctor" />
      <div className="content">
        <TopBar title="Patients History" />

        <section className="card">
          <h3>Consulted Patients</h3>

          <table className="styled-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Notes</th>
                <th>Date</th>
                <th>View</th>
              </tr>
            </thead>

            <tbody>
              {history.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    No history available yet
                  </td>
                </tr>
              )}

              {history.map((item) => (
                <tr key={item.id}>
                  <td>{item.patient?.full_name}</td>
                  <td>{item.clinical_notes || "—"}</td>
                  <td>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <Link
                      className="btn-primary"
                      to={`/doctor/history/${item.id}`}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
