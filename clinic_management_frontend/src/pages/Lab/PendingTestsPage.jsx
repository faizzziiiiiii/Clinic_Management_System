// src/pages/Lab/PendingTestsPage.jsx
import { useEffect, useState } from "react";
import API from "../../api/api";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import { Link } from "react-router-dom";

export default function PendingTestsPage() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    API.get("/lab/pending/")
      .then((res) => setRequests(res.data))
      .catch((err) => {
        console.error("Error fetching pending lab tests:", err);
        setRequests([]);
      });
  }, []);

  return (
    <div className="main-container">
      <Sidebar />
      <div className="content">
        <TopBar title="Pending Lab Tests" />

        <table className="styled-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Test</th>
              <th>Doctor</th>
              <th>Requested At</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan="5" align="center">
                  No Tests
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id}>
                  <td>{req.patient_name}</td>
                  <td>{req.test_type}</td>
                  <td>Dr. {req.doctor_name}</td>
                  <td>{req.requested_at}</td>
                  <td>
                    <Link
                      className="btn-primary"
                      to={`/lab/pending-tests/${req.id}`}
                    >
                      Process
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
