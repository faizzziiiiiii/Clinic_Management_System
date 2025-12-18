// src/pages/Pharmacy/ActivePrescriptions.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";

export default function ActivePrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/pharmacy/active-prescriptions/")
      .then((res) => setPrescriptions(res.data || []))
      .catch((err) => {
        console.error(err);
        alert("Failed to load active prescriptions");
      });
  }, []);

  return (
    <div className="main-container">
      <Sidebar role="PHARMACIST" />
      <div className="content">
        <TopBar title="Active Prescriptions" />

        <section className="card">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Patient ID</th>
                <th>Doctor</th>
                <th>Diagnosis</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {prescriptions.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No active prescriptions
                  </td>
                </tr>
              )}

              {prescriptions.map((c) => (
                <tr key={c.id}>
                  <td>{c.patient_name}</td>
                  <td>{c.patient_id}</td>
                  <td>{c.doctor_name}</td>
                  <td>{c.diagnosis || "—"}</td>
                  <td>
                    {c.created_at
                      ? new Date(c.created_at).toLocaleString()
                      : "—"}
                  </td>
                  <td>
                    <button
                      className="btn-primary"
                      onClick={() => navigate(`/pharmacy/dispense/${c.id}`)}
                    >
                      Dispense
                    </button>
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
