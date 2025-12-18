// src/components/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import {
  FaUserPlus,
  FaUsers,
  FaHospitalUser,
  FaHistory,
  FaMoneyBill,
  FaUserInjured,
  FaNotesMedical,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import "./Sidebar.css";

export default function Sidebar() {
  const location = useLocation();
  const current = location.pathname;

  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setRole(storedUser.role || null);
  }, [location.pathname]);

  if (!role) return null;

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          {/* ========= ADMIN ========= */}
          {role === "ADMIN" && (
            <>
              <li className={current === "/admin/add-employee" ? "active" : ""}>
                <Link to="/admin/add-employee">
                  <FaUserPlus /> Add Employee
                </Link>
              </li>

              <li className={current === "/admin/employees" ? "active" : ""}>
                <Link to="/admin/employees">
                  <FaUsers /> View Employees
                </Link>
              </li>

              <li className={current === "/admin/add-department" ? "active" : ""}>
                <Link to="/admin/add-department">
                  <FaHospitalUser /> Departments
                </Link>
              </li>

              <li className={current === "/admin/patient-history" ? "active" : ""}>
                <Link to="/admin/patient-history">
                  <FaHistory /> Patient History
                </Link>
              </li>

              <li className={current === "/admin/accounts" ? "active" : ""}>
                <Link to="/admin/accounts">
                  <FaMoneyBill /> Accounts
                </Link>
              </li>
            </>
          )}

          {/* ========= RECEPTIONIST ========= */}
          {role === "RECEPTIONIST" && (
            <>
              <li className={current === "/receptionist/add-patient" ? "active" : ""}>
                <Link to="/receptionist/add-patient">
                  <FaUserInjured /> Add Patient
                </Link>
              </li>

              <li className={current === "/receptionist/patients" ? "active" : ""}>
                <Link to="/receptionist/patients">
                  <FaUsers /> View Patients
                </Link>
              </li>

              <li className={current === "/receptionist/existing-appointment" ? "active" : ""}>
                <Link to="/receptionist/existing-appointment">
                  <FaNotesMedical /> Appointments
                </Link>
              </li>

              <li className={current === "/receptionist/billing" ? "active" : ""}>
                <Link to="/receptionist/billing">
                  <FaMoneyBill /> Billing
                </Link>
              </li>
            </>
          )}

          {/* ========= DOCTOR ========= */}
          {role === "DOCTOR" && (
            <>
              <li className={current === "/doctor" ? "active" : ""}>
                <Link to="/doctor">
                  <FaNotesMedical /> Dashboard
                </Link>
              </li>

              <li className={current === "/doctor/history" ? "active" : ""}>
                <Link to="/doctor/history">
                  <FaHistory /> Patients History
                </Link>
              </li>

              <li className={current === "/doctor/lab-requests" ? "active" : ""}>
                <Link to="/doctor/lab-requests">
                  <FaNotesMedical /> Lab Requests Sent
                </Link>
              </li>

              <li className={current === "/doctor/lab-results" ? "active" : ""}>
                <Link to="/doctor/lab-results">
                  <FaHospitalUser /> Lab Results Received
                </Link>
              </li>
            </>
          )}

          {/* ========= LAB TECHNICIAN ========= */}
          {role === "LAB_TECHNICIAN" && (
            <>
              <li className={current === "/lab/pending-tests" ? "active" : ""}>
                <Link to="/lab/pending-tests">
                  <FaNotesMedical /> Pending Tests
                </Link>
              </li>

              <li className={current === "/lab/completed-tests" ? "active" : ""}>
                <Link to="/lab/completed-tests">
                  <FaHistory /> Completed Tests
                </Link>
              </li>

              <li>
                <Link to="/lab/billing">
                  <i className="fas fa-file-invoice-dollar"></i> Billing
                </Link>
              </li>
            </>
          )}

          {/* ========= PHARMACIST ========= */}
          {role === "PHARMACIST" && (
            <>
              <li className={current === "/pharmacy/active-prescriptions" ? "active" : ""}>
                <Link to="/pharmacy/active-prescriptions">
                  <FaNotesMedical /> Active Prescriptions
                </Link>
              </li>

              <li className={current === "/pharmacy/history" ? "active" : ""}>
                <Link to="/pharmacy/history">
                  <FaHistory /> Purchase History
                </Link>
              </li>

              <li className={current === "/pharmacy/stock" ? "active" : ""}>
                <Link to="/pharmacy/stock">
                  <FaHospitalUser /> Stock / Inventory
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
}
