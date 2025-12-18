// src/pages/Doctor/ConsultationPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api/api";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";

const LAB_TEST_LIST = [
  { value: "BLOOD_TEST", label: "Blood Test" },
  { value: "ECG", label: "ECG" },
  { value: "XRAY", label: "X-Ray" },
  { value: "MRI", label: "MRI" },
  { value: "URINE_TEST", label: "Urine Test" },
];

export default function ConsultationPage() {
  const { appointment_id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [prescriptions, setPrescriptions] = useState([]);
  const [referLab, setReferLab] = useState(false);
  const [selectedLab, setSelectedLab] = useState("");

  const [newMed, setNewMed] = useState({
    medicine_name: "",
    dosage: "",
    frequency: "",
    duration: "",
    quantity: 1,
  });

  // 🔹 Live medicine list coming from Pharmacy
  const [medicineOptions, setMedicineOptions] = useState([]);

  // Load appointment details + pharmacy medicines
  useEffect(() => {
    API.get(`/doctor/appointments/${appointment_id}/`)
      .then((res) => setAppointment(res.data))
      .catch(() => alert("Unable to load appointment"));

    // Load inventory from pharmacy for dropdown
    API.get("/pharmacy/medicines/")
      .then((res) => {
        setMedicineOptions(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to load medicines for doctor:", err);
        // Optional: you can show an alert if you want
        // alert("Unable to load medicine list");
      });
  }, [appointment_id]);

  const addPrescription = () => {
    if (!newMed.medicine_name) return;
    setPrescriptions((prev) => [...prev, newMed]);
    setNewMed({
      medicine_name: "",
      dosage: "",
      frequency: "",
      duration: "",
      quantity: 1,
    });
  };

  const removePrescription = (index) => {
    setPrescriptions((prev) => prev.filter((_, i) => i !== index));
  };

  const finishConsultation = async () => {
    if (!diagnosis) {
      alert("Diagnosis is required!");
      return;
    }

    const payload = {
      clinical_notes: clinicalNotes,
      diagnosis: diagnosis,
      refer_to_lab: referLab,
      prescriptions,
    };

    try {
      // 1) Save the consultation
      await API.post(
        `/doctor/consultations/?appointment_id=${appointment_id}`,
        payload
      );

      // 2) Try lab request
      if (referLab && selectedLab) {
        try {
          await API.post(
            `/doctor/lab-requests/?appointment_id=${appointment_id}`,
            {
              test_type: selectedLab,
            }
          );
        } catch (labErr) {
          console.error("Lab request failed (ignored):", labErr);
        }
      }

      alert("Consultation Completed!");
      navigate("/doctor");
    } catch (err) {
      console.error(err);
      alert("Error recording consultation");
    }
  };

  if (!appointment) return <p>Loading...</p>;

  return (
    <div className="main-container">
      <Sidebar role="doctor" />
      <div className="content">
        <TopBar title="Consultation" />

        {/* Patient Info */}
        <section className="card">
          <h3>Patient Information</h3>
          <p>
            <b>Name:</b> {appointment.patient.full_name}
          </p>
          <p>
            <b>Age:</b> {appointment.patient.age}
          </p>
          <p>
            <b>Gender:</b> {appointment.patient.gender}
          </p>
          <p>
            <b>Token:</b> {appointment.token_number}
          </p>
        </section>

        {/* Diagnosis */}
        <section className="card">
          <h3>Diagnosis</h3>
          <textarea
            className="input-box"
            placeholder="Enter your medical diagnosis..."
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
          />
        </section>

        {/* Notes */}
        <section className="card">
          <h3>Notes</h3>
          <textarea
            className="input-box"
            placeholder="Optional notes for patient..."
            value={clinicalNotes}
            onChange={(e) => setClinicalNotes(e.target.value)}
          />
        </section>

        {/* Prescription */}
        <section className="card">
          <h3>Prescription</h3>

          <div className="prescription-row">
            <select
              value={newMed.medicine_name}
              onChange={(e) =>
                setNewMed({ ...newMed, medicine_name: e.target.value })
              }
            >
              <option value="">Select Medicine</option>
              {medicineOptions.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              placeholder="Qty"
              value={newMed.quantity}
              onChange={(e) =>
                setNewMed({
                  ...newMed,
                  quantity: parseInt(e.target.value || "1", 10),
                })
              }
            />

            <input
              type="text"
              placeholder="Dosage (e.g. 500mg)"
              value={newMed.dosage}
              onChange={(e) =>
                setNewMed({ ...newMed, dosage: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Frequency (e.g. 1-0-1)"
              value={newMed.frequency}
              onChange={(e) =>
                setNewMed({ ...newMed, frequency: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Duration (e.g. 5 days)"
              value={newMed.duration}
              onChange={(e) =>
                setNewMed({ ...newMed, duration: e.target.value })
              }
            />

            <button className="btn-primary" onClick={addPrescription}>
              Add
            </button>
          </div>

          <table className="styled-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Qty</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((p, i) => (
                <tr key={i}>
                  <td>{p.medicine_name}</td>
                  <td>{p.quantity}</td>
                  <td>{p.dosage}</td>
                  <td>{p.frequency}</td>
                  <td>{p.duration}</td>
                  <td>
                    <button
                      className="btn-danger"
                      onClick={() => removePrescription(i)}
                    >
                      X
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Refer to Lab – inline like you wanted */}
        <section className="card">
          <div className="refer-inline">
            <span className="refer-text">Refer to Lab</span>
            <input
              type="checkbox"
              className="refer-inline-checkbox"
              checked={referLab}
              onChange={(e) => setReferLab(e.target.checked)}
            />
          </div>

          {referLab && (
            <select
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
              className="input-box"
              style={{ maxWidth: "350px", marginTop: "12px" }}
            >
              <option value="">Select Lab Test</option>
              {LAB_TEST_LIST.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          )}
        </section>

        {/* Finish button */}
        <div style={{ width: "100%", textAlign: "right" }}>
          <button
            className="btn-success finish-btn"
            onClick={finishConsultation}
          >
            Finish Consultation
          </button>
        </div>
      </div>
    </div>
  );
}
