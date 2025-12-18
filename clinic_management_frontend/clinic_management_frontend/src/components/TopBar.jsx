import "./TopBar.css";
import logo from "../assets/hillcrest.jpg";
import { Link } from "react-router-dom";

export default function TopBar() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const roleLabel = user?.role
    ? user.role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, char => char.toUpperCase())
    : "";

  return (
    <header className="topbar-container">
      <div className="topbar-left">
        <img src={logo} alt="Hillcrest Logo" className="topbar-logo" />
        <h2 className="topbar-title">Hillcrest Medical Pavilion</h2>
      </div>

      <div className="topbar-right">
        {roleLabel && <span className="role-label">{roleLabel} Portal</span>}
        <Link to="/login">
          <button className="logout-btn">Logout</button>
        </Link>
      </div>
    </header>
  );
}
