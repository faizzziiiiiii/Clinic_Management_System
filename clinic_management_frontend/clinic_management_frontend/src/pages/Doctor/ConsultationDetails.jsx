// src/pages/Doctor/ConsultationDetails.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/api";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";

export default function ConsultationDetails() {
  const { consultation_id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get(`/doctor/consultations/${consultation_id}/`)
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error(err);
        alert("Failed to load consultation details");
      });
  }, [consultation_id]);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="main-container">
      <Sidebar role="doctor" />
      <div className="content">
        <TopBar title="Consultation Details" />

        {/* Basic Info */}
        <section className="card">
          <h3>Patient</h3>
          <p>
            <b>Name:</b> {data.patient?.full_name || "—"}
          </p>
          <p>
            <b>Date:</b>{" "}
            {data.created_at
              ? new Date(data.created_at).toLocaleString()
              : "—"}
          </p>
        </section>

        <section className="card">
          <h3>Diagnosis</h3>
          <p>{data.diagnosis || "—"}</p>
        </section>

        <section className="card">
          <h3>Notes</h3>
          <p>{data.clinical_notes || "—"}</p>
        </section>

        <section className="card">
          <h3>Prescriptions</h3>
          {data.prescriptions?.length > 0 ? (
            <ul>
              {data.prescriptions.map((p) => (
                <li key={p.id}>
                  <b>{p.medicine_name}</b>{" "}
                  {p.dosage && <>— {p.dosage}</>}{" "}
                  {p.frequency && <> — {p.frequency}</>}{" "}
                  {p.duration && <> — {p.duration}</>}
                </li>
              ))}
            </ul>
          ) : (
            <p>No medicines given</p>
          )}
        </section>
      </div>
    </div>
  );
}
