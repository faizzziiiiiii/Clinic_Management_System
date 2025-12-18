// src/pages/Lab/LabBill.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";
import "./LabBill.css";
import hillcrestLogo from "../../assets/hillcrest.jpg";  // or your exact file name


export default function LabBill() {
  const { billId } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);

  useEffect(() => {
    API.get(`/lab/billing/${billId}/`)
      .then((res) => setBill(res.data))
      .catch((err) => {
        console.error("Error loading bill:", err);
        alert("Unable to load bill");
      });
  }, [billId]);

  if (!bill) return <p style={{ padding: 20 }}>Loading Bill...</p>;

  return (
    <div className="bill-container">
      <div className="bill-box">

        <img
          src={hillcrestLogo}
          alt="Hospital Logo"
          className="bill-logo"
        />

        <h2 className="bill-title">HILLCREST MEDICAL PAVILION</h2>
        <h3 className="bill-subtitle">Lab Bill</h3>

        <table className="bill-table">
          <tbody>
            <tr><td>Bill No</td><td>{bill.id}</td></tr>
            <tr><td>Patient</td><td>{bill.patient_name}</td></tr>
            <tr><td>Amount</td><td>₹{Number(bill.amount).toFixed(2)}</td></tr>
            <tr><td>Description</td><td>{bill.description}</td></tr>
            <tr>
              <td>Date</td>
              <td>{new Date(bill.created_at).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <div className="bill-actions">
          <button className="print-btn" onClick={() => window.print()}>
            Print Bill 🧾
          </button>

          <button className="close-btn" onClick={() => navigate(-1)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
