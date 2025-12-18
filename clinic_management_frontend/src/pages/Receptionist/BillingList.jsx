// src/pages/Receptionist/BillingList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import API from "../../api/api";
import "./BillingList.css";

export default function BillingList() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await API.get("receptionist/bills/");
        const sortedBills = res.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setBills(sortedBills);
      } catch (err) {
        console.error("Failed to load bills:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  const handleViewBill = (billId) => {
    navigate(`/receptionist/billing/${billId}`);
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="content-area">
        <TopBar />
        <div className="page-content">
          <h2 className="page-title">Billing Records</h2>

          {loading ? (
            <p>Loading...</p>
          ) : bills.length === 0 ? (
            <p>No bills available.</p>
          ) : (
            <table className="bill-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Department</th>
                  <th>Doctor</th>
                  <th>Token</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr key={bill.id}>
                    <td>{bill.patient_name}</td>
                    <td>{bill.department_name}</td>
                    <td>{bill.doctor_name}</td>
                    <td>{bill.token_number}</td>
                    <td>₹{bill.consultation_fee}</td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => handleViewBill(bill.id)}
                      >
                        View Bill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
