// src/pages/Receptionist/Dashboard.jsx
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import "./Recep.css";

export default function Dashboard() {
  return (
    <div className="admin-layout">
  <Sidebar />
  <div className="content-area">
    <TopBar />

    <h2 className="page-title">Receptionist Dashboard</h2>

    <div className="recep-dashboard-container">
      <div className="welcome-box">
        <h3>Welcome to the Receptionist Panel</h3>
        <p>Use the sidebar to manage patients, billing and appointments</p>
      </div>
    </div>
  </div>
</div>

  );
}
