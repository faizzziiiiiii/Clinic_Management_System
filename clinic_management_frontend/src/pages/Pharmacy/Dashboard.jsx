// src/pages/Pharmacy/Dashboard.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";

export default function PharmacyDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // No initial fetch needed; just a hub page
  }, []);

  return (
    <div className="main-container">
      <Sidebar role="PHARMACIST" />
      <div className="content">
        <TopBar title="Pharmacy Portal" />

        <div className="doctor-info-card">
          <h2 className="doctor-name">Pharmacy</h2>
          <p className="doctor-specialization">Manage prescriptions, stock and billing</p>
        </div>

        <div className="dash-card">
          <h3 className="section-title">Quick Actions</h3>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <button
              className="btn-start"
              onClick={() => navigate("/pharmacy/active-prescriptions")}
            >
              Active Prescriptions
            </button>
            <button
              className="btn-start"
              onClick={() => navigate("/pharmacy/history")}
            >
              Purchase History
            </button>
            <button
              className="btn-start"
              onClick={() => navigate("/pharmacy/stock")}
            >
              Stock / Inventory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
