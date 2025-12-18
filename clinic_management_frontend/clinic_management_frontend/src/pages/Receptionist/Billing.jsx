import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";
import "./Billing.css";
import hospitalLogo from "../../assets/hillcrest.jpg"; // Update path if needed

export default function Billing() {
  const { billId } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const res = await API.get(`receptionist/bills/${billId}/`);
        setBill(res.data);
      } catch (error) {
        console.error("Bill fetch error:", error);
      }
    };
    fetchBill();
  }, [billId]);

  const handlePrint = () => {
    window.print();
  };

  if (!bill) {
    return <div className="bill-container"><p>Loading Bill...</p></div>;
  }

  return (
    <div className="bill-container">
      <div className="bill-card" id="bill-download-area">

        {/* Logo and Heading */}
        <img src={hospitalLogo} alt="Hospital Logo" className="bill-logo" />
        <h2 className="bill-title">HILLCREST MEDICAL PAVILION</h2>
        <p className="bill-subtitle">Consultation Bill</p>

        {/* Bill Details */}
        <div className="bill-details">
          <span>Patient</span>
          <span>{bill.patient_name}</span>
        </div>

        <div className="bill-details">
          <span>Patient ID</span>
          <span>{bill.patient}</span>
        </div>

        <div className="bill-details">
          <span>Doctor</span>
          <span>{bill.doctor_name}</span>
        </div>

        <div className="bill-details">
          <span>Department</span>
          <span>{bill.department_name}</span>
        </div>

        <div className="bill-details">
          <span>Token No</span>
          <span>{bill.token_number}</span>
        </div>

        <div className="bill-total">
          <b>Total Amount</b>
          <b>₹{bill.consultation_fee}</b>
        </div>

        {/* Buttons */}
        <div className="bill-buttons">
          <button className="print-btn" onClick={handlePrint}>
            Print Bill 🖨️
          </button>
          <button
            className="close-btn"
            onClick={() => navigate("/receptionist/patients")}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
