// src/pages/Pharmacy/PurchaseHistory.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";

export default function PurchaseHistory() {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const loadSales = () => {
    const params = search ? { params: { q: search } } : {};
    API.get("/pharmacy/sales/", params)
      .then((res) => setSales(res.data || []))
      .catch((err) => {
        console.error(err);
        alert("Failed to load purchase history");
      });
  };

  useEffect(() => {
    loadSales();
  }, []);

  // FIXED — use React Router instead of old API bill URL
  const openBill = (saleId) => {
    navigate(`/pharmacy/bill/${saleId}`);
  };

  return (
    <div className="main-container">
      <Sidebar role="PHARMACIST" />
      <div className="content">
        <TopBar title="Purchase History" />

        <section className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <input
              type="text"
              className="input-box"
              placeholder="Search by patient name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: "300px" }}
            />
            <button className="btn-primary" onClick={loadSales}>
              Search
            </button>
          </div>

          <table className="styled-table">
            <thead>
              <tr>
                <th>Bill #</th>
                <th>Patient</th>
                <th>Patient ID</th>
                <th>Doctor</th>
                <th>Total</th>
                <th>Date</th>
                <th>Bill</th>
              </tr>
            </thead>

            <tbody>
              {sales.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No purchases found
                  </td>
                </tr>
              )}

              {sales.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.patient_name}</td>
                  <td>{s.patient_id}</td>
                  <td>{s.doctor_name || "—"}</td>
                  <td>₹ {Number(s.total_amount).toFixed(2)}</td>
                  <td>
                    {s.created_at
                      ? new Date(s.created_at).toLocaleString()
                      : "—"}
                  </td>
                  <td>
                    <button
                      className="btn-primary"
                      onClick={() => openBill(s.id)}
                    >
                      View / Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
