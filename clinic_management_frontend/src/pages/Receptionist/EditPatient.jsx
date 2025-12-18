// src/pages/Receptionist/EditPatient.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import API from "../../api/api";
import "../Receptionist/Recep.css";

export default function EditPatient() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState({
    patient_id: "",
    full_name: "",
    age: "",
    gender: "",
    blood_group: "",
    contact_number: "",
    address: "",
  });

  const [errors, setErrors] = useState({});

  const fetchPatient = async () => {
    try {
      // ✅ NO leading slash
      const response = await API.get(`receptionist/patients/${id}/`);
      setPatient(response.data);
    } catch (err) {
      console.error("Error fetching patient:", err);
      alert("Failed to load patient data");
      navigate("/receptionist/patients");
    }
  };

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const handleInput = (field, value) => {
    setPatient({ ...patient, [field]: value });
  };

  const validate = () => {
    let newErrors = {};

    if (!patient.full_name.trim() || patient.full_name.length < 3)
      newErrors.full_name = "Name must be at least 3 characters";

    if (!patient.age || patient.age < 0 || patient.age > 120)
      newErrors.age = "Age must be between 0 and 120";

    if (!patient.blood_group) newErrors.blood_group = "Select blood group";

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(patient.contact_number))
      newErrors.contact_number = "Phone must be 10 digits";

    if (!patient.gender) newErrors.gender = "Select gender";

    if (!patient.address.trim() || patient.address.length < 5)
      newErrors.address = "Address must be at least 5 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updatePatient = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      full_name: patient.full_name,
      age: parseInt(patient.age),
      gender: patient.gender,
      blood_group: patient.blood_group,
      contact_number: patient.contact_number,
      address: patient.address,
    };

    try {
      // ✅ NO leading slash
      await API.put(`receptionist/patients/${id}/`, payload);
      alert("Patient updated successfully!");
      navigate("/receptionist/patients");
    } catch (err) {
      console.error("Update Failed:", err.response?.data);
      alert("Failed to update patient");
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="content-area">
        <TopBar />

        <div className="edit-page-wrapper">
          <form className="edit-form-card" onSubmit={updatePatient}>
            <h2 className="edit-page-title">Edit Patient</h2>

            <div className="id-display-row">
              Patient ID: <span>{patient.patient_id}</span>
            </div>

            <div className="form-row-edit">
              <div>
                <label>Full Name</label>
                <input
                  type="text"
                  value={patient.full_name}
                  onChange={(e) => handleInput("full_name", e.target.value)}
                />
                {errors.full_name && (
                  <span className="error">{errors.full_name}</span>
                )}
              </div>

              <div>
                <label>Age</label>
                <input
                  type="number"
                  value={patient.age}
                  onChange={(e) => handleInput("age", e.target.value)}
                />
                {errors.age && <span className="error">{errors.age}</span>}
              </div>
            </div>

            <div className="form-row-edit">
              <div>
                <label>Blood Group</label>
                <select
                  value={patient.blood_group}
                  onChange={(e) => handleInput("blood_group", e.target.value)}
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

              <div>
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

            <label className="edit-gender-section">Gender</label>
            <div className="edit-gender-options">
              {["Male", "Female", "Other"].map((g) => (
                <label key={g}>
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={patient.gender === g}
                    onChange={(e) => handleInput("gender", e.target.value)}
                  />
                  {g}
                </label>
              ))}
            </div>
            {errors.gender && <span className="error">{errors.gender}</span>}

            <label>Address</label>
            <textarea
              value={patient.address}
              onChange={(e) => handleInput("address", e.target.value)}
            ></textarea>
            {errors.address && (
              <span className="error">{errors.address}</span>
            )}

            <div className="button-row-edit">
              <button type="submit" className="btn-update-orange">
                Update Changes
              </button>
              <button
                type="button"
                className="btn-cancel-gray"
                onClick={() => navigate("/receptionist/patients")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
