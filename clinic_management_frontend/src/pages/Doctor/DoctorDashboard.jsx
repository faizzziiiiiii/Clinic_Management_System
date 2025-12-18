import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import "./DoctorDashboard.css";

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState({});
  const [current, setCurrent] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/doctor/profile/")
      .then((res) => setDoctor(res.data))
      .catch(() => {});

    API.get("/doctor/appointments/current/")
      .then((res) => setCurrent(res.data || null))
      .catch(() => setCurrent(null));

    API.get("/doctor/appointments/upcoming/")
      .then((res) => setUpcoming(res.data || []))
      .catch(() => {});
  }, []);

  return (
    <div className="main-container">
      <Sidebar role="doctor" />

      <div className="content doctor-dashboard-container">
        <TopBar title="Doctor Portal" />

        {/* Doctor Details */}
        <div className="doctor-info-card">
          <h2 className="doctor-name">{doctor.name || "Doctor"}</h2>
          <p className="doctor-specialization">
            {doctor.department_name || "General"}
          </p>
        </div>

        {/* Current Appointment */}
        <div className="dash-card">
          <h3 className="section-title">Current Appointment</h3>
          {current ? (
            <>
              <p><strong>Token:</strong> {current.token_number}</p>
              <p><strong>Patient:</strong> {current.patient?.full_name}</p>

              <button
                className="btn-start"
                onClick={() => navigate(`/doctor/consult/${current.id}`)}
              >
                Start Consultation
              </button>
            </>
          ) : (
            <p className="empty-text">No current appointment</p>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="dash-card">
          <h3 className="section-title">Upcoming Appointments</h3>
          {upcoming.length > 0 ? (
            <ul className="upcoming-list">
              {upcoming.map((appt) => (
                <li key={appt.id}>
                  Token {appt.token_number} — {appt.patient?.full_name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-text">No more patients in queue</p>
          )}
        </div>
      </div>
    </div>
  );
}
