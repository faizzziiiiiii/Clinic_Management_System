// src/pages/Doctor/LabResultsPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/api";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";

export default function LabResultsPage() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    API.get("/doctor/lab-results/")
      .then((res) => setResults(res.data))
      .catch((err) => {
        console.error("Error fetching lab results:", err);
        setResults([]);
      });
  }, []);

  return (
    <div className="main-container">
      <Sidebar />
      <div className="content">
        <TopBar title="Lab Results Received" />

        <section className="card">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Test</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No lab results yet
                  </td>
                </tr>
              ) : (
                results.map((item) => (
                  <tr key={item.id}>
                    <td>{item.patient_name}</td>
                    <td>{item.test_type}</td>
                    <td>{item.status}</td>
                    <td>
                      {item.processed_at
                        ? new Date(item.processed_at).toLocaleDateString()
                        : item.requested_at
                        ? new Date(item.requested_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <Link
                        to={`/doctor/lab-results/${item.id}`}
                        className="btn-primary"
                      >
                        View Report
                      </Link>
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
