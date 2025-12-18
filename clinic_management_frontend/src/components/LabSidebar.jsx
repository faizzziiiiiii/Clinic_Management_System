// src/components/LabSidebar.jsx
import { Link, useLocation } from "react-router-dom";
import {
  FaFlask,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import "./Sidebar.css";

export default function LabSidebar() {
  const location = useLocation();
  const current = location.pathname;

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li className={current === "/lab/pending-tests" ? "active" : ""}>
            <Link to="/lab/pending-tests">
              <FaClock /> Pending Tests
            </Link>
          </li>

          <li className={current === "/lab/completed-tests" ? "active" : ""}>
            <Link to="/lab/completed-tests">
              <FaCheckCircle /> Completed Tests
            </Link>
          </li>

          <li className="logout-btn">
            <a
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
            >
              Logout
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
