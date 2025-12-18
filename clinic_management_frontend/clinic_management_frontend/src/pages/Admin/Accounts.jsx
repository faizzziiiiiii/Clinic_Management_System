import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import API from "../../api/api";
import "./Admin.css";

export default function Accounts() {
  const [bills, setBills] = useState([]);

  const loadBills = () => {
    API.get("admin/bills/")
      .then(res => setBills(res.data))
      .catch(() => console.error("Failed to load bills"));
  };

  useEffect(() => {
    loadBills();
  }, []);

  const deleteBill = async (id) => {
    if (!window.confirm("Delete this bill record?")) return;
    try {
      await API.delete(`receptionist/bills/${id}/`);
      loadBills();
    } catch {
      alert("Failed to delete bill!");
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="content-area">
        <TopBar />

        <div className="page-content">
          <h2 className="page-title">Accounts & Billing</h2>

          <table className="employees-table">
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Department</th>
                <th>Total (₹)</th>
                <th>Date</th>
                <th style={{ textAlign: "center" }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {bills.map((b) => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{b.patient_name}</td>
                  <td>{b.doctor_name}</td>
                  <td>{b.department_name}</td>
                  <td>{Number(b.consultation_fee).toFixed(2)}</td>
                  <td>{new Date(b.created_at).toLocaleString()}</td>

                  <td className="table-actions">
                    <button
                      className="btn-danger"
                      onClick={() => deleteBill(b.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}
