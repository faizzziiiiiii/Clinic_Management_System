// src/pages/Lab/LabBillingPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import API from "../../api/api";

export default function LabBillingPage() {
  const [bills, setBills] = useState(null); // null = loading, [] = empty
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    API.get("/lab/billing/")
      .then((res) => {
        if (!mounted) return;
        setBills(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Error loading bills:", err);
        if (!mounted) return;
        setBills([]); // show empty state on error
      });
    return () => {
      mounted = false;
    };
  }, []);

  const openBillPage = (billId) => {
    // navigate to the lab bill react page (so it uses same layout and print styles)
    navigate(`/lab/bill/${billId}`);
  };

  if (bills === null) {
    return (
      <div className="main-container">
        <Sidebar />
        <div className="content">
          <TopBar title="Lab Billing Records" />
          <p style={{ padding: 20 }}>Loading bills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <Sidebar />
      <div className="content">
        <TopBar title="Lab Billing Records" />

        <table className="styled-table">
          <thead>
            <tr>
              <th>Bill No</th>
              <th>Patient</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {bills.length === 0 ? (
              <tr>
                <td colSpan="6" align="center">
                  No Bills Found
                </td>
              </tr>
            ) : (
              bills.map((bill) => (
                <tr key={bill.id}>
                  <td>{bill.id}</td>
                  <td>{bill.patient_name}</td>
                  <td>₹{Number(bill.amount).toFixed(2)}</td>
                  <td style={{ maxWidth: 300, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {bill.description}
                  </td>
                  <td>
                    {bill.created_at
                      ? new Date(bill.created_at).toLocaleString()
                      : "—"}
                  </td>
                  <td>
                    <button
                      className="btn-primary"
                      onClick={() => openBillPage(bill.id)}
                    >
                      View / Print
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
