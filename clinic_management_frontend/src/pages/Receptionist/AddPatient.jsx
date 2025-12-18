// src/pages/Receptionist/AddPatient.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import API from "../../api/api";
import "../Receptionist/Recep.css";

export default function AddPatient() {
  const navigate = useNavigate();

  /* ---------------- PATIENT STATE ---------------- */
  const [patient, setPatient] = useState({
    name: "",
    age: "",
    blood_group: "",
    contact_number: "",
    gender: "",
    address: "",
  });

  const [errors, setErrors] = useState({});

  /* ----------- EXISTING PATIENT SEARCH ------------ */
  const [searchPhone, setSearchPhone] = useState("");
  const [foundPatient, setFoundPatient] = useState(null);
  const [searchMsg, setSearchMsg] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  /* ------------- APPOINTMENT STATE ---------------- */
  const [showAppointment, setShowAppointment] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointment, setAppointment] = useState({
    department: "",
    doctor: "",
    consultation_fee: "",
  });

  /* ================= HELPERS ================= */

  const handleInput = (field, value) => {
    setPatient((prev) => ({ ...prev, [field]: value }));
  };

  const validatePatient = () => {
    const newErrors = {};
    const phoneRegex = /^[0-9]{10}$/;

    if (!patient.name.trim() || patient.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!patient.age || patient.age < 0 || patient.age > 120) {
      newErrors.age = "Age must be between 0 and 120";
    }

    if (!patient.blood_group) {
      newErrors.blood_group = "Please select a blood group";
    }

    if (!phoneRegex.test(patient.contact_number)) {
      newErrors.contact_number = "Phone must be 10 digits";
    }

    if (!patient.gender) {
      newErrors.gender = "Please select gender";
    }

    if (!patient.address.trim() || patient.address.length < 5) {
      newErrors.address = "Address must be at least 5 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ========== SEARCH EXISTING PATIENT (BY PHONE) ========== */
  const handleSearchExisting = async () => {
    setSearchMsg("");
    setFoundPatient(null);
    setShowAppointment(false);

    if (!searchPhone.match(/^\d{10}$/)) {
      setSearchMsg("Enter valid 10-digit phone number");
      return;
    }

    try {
      setSearchLoading(true);

      // GET /api/receptionist/patients/
      const res = await API.get("receptionist/patients/");
      const allPatients = Array.isArray(res.data) ? res.data : [];

      const matches = allPatients.filter(
        (p) => String(p.contact_number) === String(searchPhone)
      );

      if (matches.length > 0) {
        const p = matches[0];

        setPatient({
          name: p.full_name || "",
          age: p.age || "",
          blood_group: p.blood_group || "",
          contact_number: p.contact_number || "",
          gender: p.gender || "",
          address: p.address || "",
        });

        setFoundPatient(p);
        setSearchMsg(`Patient found: ${p.full_name} (${p.patient_id})`);
        setShowAppointment(true);
      } else {
        setSearchMsg("No patient found");
      }
    } catch (err) {
      console.error("Search error:", err.response?.data || err);
      setSearchMsg("Server error while searching");
    } finally {
      setSearchLoading(false);
    }
  };

  /* ========== RESET TO NEW PATIENT ========== */
  const resetToNewPatient = () => {
    setFoundPatient(null);
    setShowAppointment(false);
    setPatient({
      name: "",
      age: "",
      blood_group: "",
      contact_number: "",
      gender: "",
      address: "",
    });
    setAppointment({
      department: "",
      doctor: "",
      consultation_fee: "",
    });
    setDoctors([]);
    setSearchMsg("");
  };

  /* ========== REGISTER NEW PATIENT ========== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePatient()) return;

    const payload = {
      full_name: patient.name,
      age: parseInt(patient.age, 10),
      gender: patient.gender,
      blood_group: patient.blood_group,
      contact_number: patient.contact_number,
      address: patient.address,
    };

    try {
      // POST /api/receptionist/patients/
      const res = await API.post("receptionist/patients/", payload);
      const created = res.data;

      setFoundPatient(created);
      setSearchMsg(
        `New patient created: ${created.full_name} (${created.patient_id})`
      );
      setShowAppointment(true);
    } catch (err) {
      console.error("Register patient error:", err.response?.data || err);
      alert("Failed to register patient (check console for details)");
    }
  };

  /* ========== LOAD DEPARTMENTS ONCE ========== */
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        // GET /api/receptionist/departments/
        const res = await API.get("receptionist/departments/");
        setDepartments(res.data || []);
      } catch (err) {
        console.error("Error loading departments:", err.response?.data || err);
      }
    };

    loadDepartments();
  }, []);

  /* ========== LOAD DOCTORS WHEN DEPARTMENT CHANGES ========== */
  useEffect(() => {
    if (!appointment.department) {
      setDoctors([]);
      return;
    }

    const loadDoctors = async () => {
      try {
        // GET /api/receptionist/doctors/by-department/<id>/
        const res = await API.get(
          `receptionist/doctors/by-department/${appointment.department}/`
        );
        setDoctors(res.data || []);
      } catch (err) {
        console.error("Error loading doctors:", err.response?.data || err);
        setDoctors([]);
      }
    };

    loadDoctors();
  }, [appointment.department]);

  /* ========== BOOK APPOINTMENT ========== */
  const handleBookAppointment = async () => {
    if (!foundPatient) {
      alert("No patient selected");
      return;
    }

    if (!appointment.department || !appointment.doctor) {
      alert("Select department & doctor");
      return;
    }

    const payload = {
      patient: foundPatient.id,
      doctor: Number(appointment.doctor),
      department: Number(appointment.department),
      consultation_fee: parseFloat(appointment.consultation_fee) || 0,
    };

    try {
      // POST /api/receptionist/appointments/
      const apptRes = await API.post("receptionist/appointments/", payload);

      // POST /api/receptionist/bills/
      const billRes = await API.post("receptionist/bills/", {
        appointment: apptRes.data.id,
        consultation_fee: payload.consultation_fee,
      });

      alert(`Appointment booked! Token: ${apptRes.data.token_number}`);
      navigate(`/receptionist/billing/${billRes.data.id}`);
    } catch (err) {
      console.error("Book appointment error:", err.response?.data || err);
      alert("Failed to book appointment");
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="content-area">
        <TopBar />

        <div className="page-content">
          <h2 className="page-title">New Patient Registration</h2>

          {/* -------- SEARCH EXISTING PATIENT -------- */}
          <div className="existing-search-box">
            <div className="existing-search-title">Search Existing Patient</div>
            <div className="existing-search-row">
              <input
                type="text"
                placeholder="Enter phone number"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
              />
              <button onClick={handleSearchExisting}>
                {searchLoading ? "Searching..." : "Search"}
              </button>
            </div>

            {searchMsg && (
              <div
                className={
                  foundPatient ? "search-msg success" : "search-msg warning"
                }
              >
                {searchMsg}
              </div>
            )}

            {foundPatient && (
              <button className="btn-cancel" onClick={resetToNewPatient}>
                Register New Patient Instead
              </button>
            )}
          </div>

          {/* -------- NEW PATIENT FORM -------- */}
          {!foundPatient && (
            <form className="patient-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-section">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={patient.name}
                    onChange={(e) => handleInput("name", e.target.value)}
                  />
                  {errors.name && <span className="error">{errors.name}</span>}
                </div>

                <div className="form-section">
                  <label>Age</label>
                  <input
                    type="number"
                    value={patient.age}
                    onChange={(e) => handleInput("age", e.target.value)}
                  />
                  {errors.age && <span className="error">{errors.age}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-section">
                  <label>Blood Group</label>
                  <select
                    value={patient.blood_group}
                    onChange={(e) =>
                      handleInput("blood_group", e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                      (bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      )
                    )}
                  </select>
                  {errors.blood_group && (
                    <span className="error">{errors.blood_group}</span>
                  )}
                </div>

                <div className="form-section">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    maxLength="10"
                    value={patient.contact_number}
                    onChange={(e) =>
                      handleInput("contact_number", e.target.value)
                    }
                  />
                  {errors.contact_number && (
                    <span className="error">{errors.contact_number}</span>
                  )}
                </div>
              </div>

              <label>Gender</label>
              <div className="gender-options">
                {["Male", "Female", "Other"].map((g) => (
                  <label key={g}>
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      onChange={(e) => handleInput("gender", e.target.value)}
                    />
                    {g}
                  </label>
                ))}
              </div>
              {errors.gender && (
                <span className="error">{errors.gender}</span>
              )}

              <label>Address</label>
              <textarea
                rows="3"
                value={patient.address}
                onChange={(e) => handleInput("address", e.target.value)}
              />
              {errors.address && (
                <span className="error">{errors.address}</span>
              )}

              <div className="button-row">
                <button type="submit" className="btn-submit">
                  Add Patient & Continue
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate("/receptionist")}
                >
                  Back
                </button>
              </div>
            </form>
          )}

          {/* -------- APPOINTMENT SECTION -------- */}
          {showAppointment && foundPatient && (
            <div className="appointment-card">
              <h3>Book Appointment</h3>
              <p>
                For: <b>{foundPatient.full_name}</b> (ID:{" "}
                {foundPatient.patient_id})
              </p>

              <div className="form-row">
                <div className="form-section">
                  <label>Department</label>
                  <select
                    value={appointment.department}
                    onChange={(e) =>
                      setAppointment((prev) => ({
                        ...prev,
                        department: e.target.value,
                        doctor: "",
                      }))
                    }
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-section">
                  <label>Doctor</label>
                  <select
                    value={appointment.doctor}
                    onChange={(e) =>
                      setAppointment((prev) => ({
                        ...prev,
                        doctor: e.target.value,
                      }))
                    }
                    disabled={doctors.length === 0}
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.first_name
                          ? `${doc.first_name} ${doc.last_name || ""}`.trim()
                          : doc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label>Consultation Fee (₹)</label>
              <input
                type="number"
                value={appointment.consultation_fee}
                onChange={(e) =>
                  setAppointment((prev) => ({
                    ...prev,
                    consultation_fee: e.target.value,
                  }))
                }
              />

              <div className="appointment-actions">
                <button
                  className="btn-book-appointment"
                  onClick={handleBookAppointment}
                >
                  Confirm & Generate Bill
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => navigate("/receptionist/patients")}
                >
                  Skip Appointment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
