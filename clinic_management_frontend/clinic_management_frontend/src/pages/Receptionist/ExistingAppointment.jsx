// src/pages/Receptionist/ExistingAppointment.jsx
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import API from "../../api/api";
import "../Receptionist/Recep.css";
import { FaSearch } from "react-icons/fa";

export default function ExistingAppointment() {
  const [appointments, setAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [search, setSearch] = useState("");

  const fetchAppointments = async () => {
    try {
      // ✅ NO leading slash
      const response = await API.get("receptionist/appointments/");
      setAppointments(response.data);
      setAllAppointments(response.data);
    } catch (err) {
      console.error("Error loading appointments:", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearch(keyword);

    const filtered = allAppointments.filter((ap) =>
      ap.patient?.full_name?.toLowerCase().includes(keyword)
    );

    setAppointments(filtered);
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="content-area">
        <TopBar />

        <div className="page-content">
          <h2 className="page-title">Existing Appointments</h2>

          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by Patient Name..."
              value={search}
              onChange={handleSearch}
            />
          </div>

          <table className="patients-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Department</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">
                    No Appointments Found
                  </td>
                </tr>
              ) : (
                appointments.map((ap) => (
                  <tr key={ap.id}>
                    <td>{ap.token_number}</td>
                    <td>{ap.patient?.full_name || "—"}</td>
                    <td>
                      {ap.doctor
                        ? `${ap.doctor.first_name} ${
                            ap.doctor.last_name || ""
                          }`.trim()
                        : "—"}
                    </td>
                    <td>{ap.department?.name || "—"}</td>
                    <td>
                      <span
                        className={`recep-status-badge ${
                          ap.status === "Completed" ? "completed" : "pending"
                        }`}
                      >
                        {ap.status}
                      </span>
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
