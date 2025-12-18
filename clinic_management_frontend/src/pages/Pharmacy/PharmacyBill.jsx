import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api/api";
import "./PharmacyBill.css";

export default function PharmacyBill() {
  const { saleId } = useParams();
  const navigate = useNavigate();

  const [sale, setSale] = useState(null);

  useEffect(() => {
    API.get(`/pharmacy/sales/${saleId}/`)
      .then((res) => setSale(res.data))
      .catch(() => alert("Unable to load bill"));
  }, [saleId]);

  if (!sale) return <p>Loading bill...</p>;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bill-container">
      <div className="bill-box">
        {/* Header */}
        <h2 className="bill-title">HILLCREST MEDICAL PAVILION</h2>
        <h3 className="bill-subtitle">Pharmacy Bill</h3>

        <table className="bill-table">
          <tbody>
            <tr>
              <td>Patient</td>
              <td>{sale.patient_name}</td>
            </tr>
            <tr>
              <td>Patient ID</td>
              <td>{sale.patient_id}</td>
            </tr>
            <tr>
              <td>Doctor</td>
              <td>{sale.doctor_name || "—"}</td>
            </tr>
            <tr>
              <td>Date</td>
              <td>{new Date(sale.created_at).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <h4>Items Dispensed</h4>
        <table className="bill-items">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {sale.items?.map((it) => (
              <tr key={it.id}>
                <td>{it.medicine_name}</td>
                <td>{it.quantity}</td>
                <td>₹{Number(it.unit_price).toFixed(2)}</td>
                <td>₹{Number(it.subtotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="bill-total">
          <strong>Total Amount:</strong>{" "}
          <span>₹{Number(sale.total_amount).toFixed(2)}</span>
        </div>

        <div className="bill-actions">
          <button className="print-btn" onClick={handlePrint}>
            Print Bill 🧾
          </button>
          <button className="close-btn" onClick={() => navigate("/pharmacy/history")}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
