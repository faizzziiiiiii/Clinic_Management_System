// src/pages/Doctor/LabRequestsPage.jsx
import { useEffect, useState } from "react";
import API from "../../api/api";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";

export default function LabRequestsPage() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    API.get("/doctor/lab-requests/")
      .then((res) => {
        console.log("Lab Requests:", res.data);
        setRequests(res.data);
      })
      .catch((err) => {
        console.error("Error fetching lab requests:", err);
        setRequests([]);
      });
  }, []);

  return (
    <div className="main-container">
      <Sidebar />
      <div className="content">
        <TopBar title="Lab Requests Sent" />

        <section className="card">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Test</th>
                <th>Status</th>
                <th>Requested On</th>
              </tr>
            </thead>

            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    No lab requests yet
                  </td>
                </tr>
              ) : (
                requests.map((item) => (
                  <tr key={item.id}>
                    <td>{item.patient_name}</td>
                    <td>{item.test_type}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          item.status === "COMPLETED"
                            ? "status-success"
                            : "status-warning"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      {item.requested_at
                        ? new Date(item.requested_at).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
