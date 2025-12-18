// src/pages/Doctor/LabResultViewPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/api";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import "./LabResultReport.css";

export default function LabResultViewPage() {
  const { requestId } = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    API.get(`/doctor/lab-results/${requestId}/`)
      .then((res) => setReport(res.data))
      .catch((err) => {
        console.error("Error loading report:", err);
        alert("Error loading report");
      });
  }, [requestId]);

  if (!report) return <p>Loading...</p>;

  const results = report.result?.result_details
    ? JSON.parse(report.result.result_details)
    : {};

  return (
    <div className="main-container">
      <Sidebar />
      <div className="content">
        <TopBar title="Lab Report" />

        <div className="report-container" id="report-content">
          <h2 className="hospital-title">Hillcrest Medical Pavilion</h2>
          <h3 className="report-title">Laboratory Diagnostic Report</h3>

          <section className="info-section">
            <p>
              <b>Patient:</b> {report.patient_name}
            </p>
            <p>
              <b>Doctor:</b> Dr. {report.doctor_name}
            </p>
            <p>
              <b>Test:</b> {report.test_type}
            </p>
            {report.result?.created_at && (
              <p>
                <b>Date:</b> {report.result.created_at.slice(0, 10)}
              </p>
            )}
          </section>

          <table className="report-table">
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
              {Object.keys(results).map((key) => {
                const row = results[key];
                const num = parseFloat(row.value);
                let status = "";

                if (!isNaN(num)) {
                  if (row.low != null && num < row.low) status = "LOW";
                  else if (row.high != null && num > row.high) status = "HIGH";
                  else status = "NORMAL";
                }

                return (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>{row.value}</td>
                    <td>{row.unit}</td>
                    <td>
                      {row.low != null && row.high != null
                        ? `${row.low} - ${row.high}`
                        : "-"}
                    </td>
                    <td className={`status-badge ${status.toLowerCase()}`}>
                      {status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="print-btn-area">
          <button className="btn-primary" onClick={() => window.print()}>
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
}
