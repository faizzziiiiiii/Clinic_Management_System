import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import "./Admin.css";

export default function AdminDashboard() {
  return (
    <div className="main-container">
      <Sidebar role="admin" />

      <div className="content">
        <TopBar title="ADMIN PORTAL" />

        {/* Centered Welcome Block */}
        <div className="welcome-container">
          <div className="welcome-card">
            <h2>Welcome to Admin Panel</h2>
            <p>Manage departments, employees, billing reports & patient tracking</p>
          </div>
        </div>

      </div>
    </div>
  );
}
