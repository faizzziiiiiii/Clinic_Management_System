// src/pages/Lab/CompletedTestsPage.jsx
import { useEffect, useState } from "react";
import API from "../../api/api";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import { Link } from "react-router-dom";

export default function CompletedTestsPage() {
  const [tests, setTests] = useState([]);

  useEffect(() => {
    API.get("/lab/completed/")
      .then((res) => setTests(res.data))
      .catch((err) => {
        console.error("Error fetching completed tests:", err);
        setTests([]);
      });
  }, []);

  return (
    <div className="main-container">
      <Sidebar />
      <div className="content">
        <TopBar title="Completed Lab Tests" />

        <table className="styled-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Test</th>
              <th>Doctor</th>
              <th>Completed At</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {tests.length === 0 ? (
              <tr>
                <td colSpan="5" align="center">
                  No Completed Tests
                </td>
              </tr>
            ) : (
              tests.map((req) => (
                <tr key={req.id}>
                  <td>{req.patient_name}</td>
                  <td>{req.test_type}</td>
                  <td>Dr. {req.doctor_name}</td>
                  <td>{req.processed_at}</td>
                  <td>
                    <Link
                      className="btn-primary"
                      to={`/lab/results/${req.id}`}
                    >
                      View Report
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
