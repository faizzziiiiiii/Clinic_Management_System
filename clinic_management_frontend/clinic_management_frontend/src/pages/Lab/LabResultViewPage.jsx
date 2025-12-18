// src/pages/Lab/LabResultViewPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/api";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import "./LabResultReport.css";
import hillcrestLogo from "../../assets/hillcrest.jpg";
import "./status.css";

export default function LabResultViewPage() {
  const { requestId } = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const path = window.location.pathname;

    const apiUrl = path.includes("/doctor/")
      ? `/doctor/lab-results/${requestId}/`
      : `/lab/completed/${requestId}/`;

    API.get(apiUrl)
      .then((res) => setReport(res.data))
      .catch((err) => {
        console.error("Error loading report:", err);
        alert("Unable to load report");
      });
  }, [requestId]);

  if (!report || !report.result) return <p>Loading...</p>;

  let results = [];
  try {
    results = JSON.parse(report.result.result_details || "[]");
  } catch {
    console.error("Invalid result format");
  }

  return (
    <div className="main-container">
      <Sidebar />
      <div className="content">
        <TopBar title="Lab Report" />

        <div id="report-content" className="report-container">
          
          {/* Header Section */}
          <div className="report-header">
            <img
              src={hillcrestLogo}
              alt="HILLCREST LOGO"
              className="hospital-logo"
            />
            <h1 className="hospital-title">HILLCREST MEDICAL PAVILION</h1>
            <h3 className="report-title">Diagnostic Lab Report</h3>
          </div>

          <hr className="report-divider" />

          {/* Patient Details */}
          <p><b>Patient:</b> {report.patient_name}</p>
          <p><b>Doctor:</b> Dr. {report.doctor_name}</p>
          <p><b>Test:</b> {report.test_type}</p>
          <p><b>Date:</b> {report.processed_at}</p>

          {/* Table */}
          <table className="styled-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Value</th>
                <th>Unit</th>
                <th>Normal Range</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row, index) => {
                const value = parseFloat(row.value);
                let statusClass = "status-normal";
                let statusText = "NORMAL";

                if (!isNaN(value)) {
                  if (value < row.low) {
                    statusClass = "status-low";
                    statusText = "LOW";
                  } else if (value > row.high) {
                    statusClass = "status-high";
                    statusText = "HIGH";
                  }
                }

                return (
                  <tr key={index}>
                    <td>{row.parameter}</td>
                    <td>{row.value}</td>
                    <td>{row.unit}</td>
                    <td>{row.low} – {row.high}</td>
                    <td>
                      {statusText && (
                        <span className={`status-badge ${statusClass}`}>
                          {statusText}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button
          className="btn-primary print-btn-area"
          onClick={() => window.print()}
        >
          Print
        </button>
      </div>
    </div>
  );
}
