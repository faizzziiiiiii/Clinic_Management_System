import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api/api";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import { TEST_PARAMETERS } from "../../constants/LabTestParameters";
import "./status.css";

export default function ProcessLabTestPage() {
  const { requestId } = useParams();
  const [labRequest, setLabRequest] = useState(null);
  const [values, setValues] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    API.get(`/lab/pending/${requestId}/`)
      .then((res) => {
        setLabRequest(res.data);

        const template = TEST_PARAMETERS[res.data.test_type] || [];
        const initialValues = {};
        template.forEach((p) => {
          initialValues[p.name] = "";
        });
        setValues(initialValues);
      })
      .catch((err) => {
        console.error("Error loading lab request:", err);
        alert("Unable to load lab request");
      });
  }, [requestId]);

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const getStatus = (value, low, high) => {
    if (low == null || high == null) return ""; // No status for text fields
    const num = parseFloat(value);
    if (isNaN(num)) return "";
    if (num < low) return "LOW";
    if (num > high) return "HIGH";
    return "NORMAL";
  };

  const handleSubmit = () => {
    if (!labRequest) return;

    const template = TEST_PARAMETERS[labRequest.test_type] || [];

    // Validation
    for (let p of template) {
      if (!values[p.name]) {
        alert(`Please enter value for ${p.name}`);
        return;
      }
    }

    const resultArray = template.map((p) => ({
      parameter: p.name,
      value: values[p.name],
      unit: p.unit || "",
      low: p.low ?? null,
      high: p.high ?? null,
      status: p.low != null && p.high != null
        ? getStatus(values[p.name], p.low, p.high)
        : ""
    }));

    const payload = {
      result_details: JSON.stringify(resultArray),
    };

    API.post(`/lab/process/?request_id=${labRequest.id}`, payload)
      .then(() => {
        alert("Test result submitted successfully");
        navigate("/lab/completed-tests");
      })
      .catch((err) => {
        console.error("Error submitting result:", err.response?.data || err);
        alert("Error submitting result");
      });
  };

  if (!labRequest) return <p>Loading...</p>;

  const template = TEST_PARAMETERS[labRequest.test_type] || [];

  return (
    <div className="main-container">
      <Sidebar />
      <div className="content">
        <TopBar title="Process Lab Test" />

        <section className="glass-card">
          <h3>Test Details</h3>
          <p><b>Patient:</b> {labRequest.patient_name}</p>
          <p><b>Referred By:</b> Dr. {labRequest.doctor_name}</p>
          <p><b>Test Type:</b> {labRequest.test_type}</p>
          {labRequest.remarks && (
            <p><b>Remarks:</b> {labRequest.remarks}</p>
          )}
        </section>

        <section className="card">
          <h3>Enter Parameters</h3>

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
              {template.map((p) => {
                const value = values[p.name] ?? "";
                const status = getStatus(value, p.low, p.high);

                return (
                  <tr key={p.name}>
                    <td>{p.name}</td>
                    <td>
                      {p.isText ? (
                        <textarea
                          rows={3}
                          value={value}
                          onChange={(e) => handleChange(p.name, e.target.value)}
                          placeholder="Write findings here"
                          style={{ width: "100%" }}
                        ></textarea>
                      ) : (
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => handleChange(p.name, e.target.value)}
                        />
                      )}
                    </td>
                    <td>{p.unit ?? "-"}</td>
                    <td>
                      {p.low != null && p.high != null
                        ? `${p.low} - ${p.high}`
                        : "-"}
                    </td>
                    <td>
                      {status && (
                        <span className={`status-badge status-${status.toLowerCase()}`}>
                          {status}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <button className="btn-success finish-btn" onClick={handleSubmit}>
            Finish Test
          </button>
        </section>
      </div>
    </div>
  );
}
