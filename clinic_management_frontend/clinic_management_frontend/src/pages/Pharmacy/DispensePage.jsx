// src/pages/Pharmacy/DispensePage.jsx
import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";

/**
 * DispensePage with client-side stock validation.
 * - prevents qty > stock
 * - shows inline errors / helper messages
 * - disables finalise button while invalid
 */

export default function DispensePage() {
  const { consultationId } = useParams();
  const navigate = useNavigate();

  const [consultation, setConsultation] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [items, setItems] = useState([]); // { prescriptionName, medicineId, quantity }
  const [itemMessages, setItemMessages] = useState({}); // index -> string message (error or info)

  const [extraItem, setExtraItem] = useState({
    medicineId: "",
    quantity: 1,
    message: "",
  });

  // Load consultation + medicines
  useEffect(() => {
    API.get(`/pharmacy/consultation/${consultationId}/`)
      .then((res) => {
        setConsultation(res.data);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load consultation for pharmacy");
      });

    API.get("/pharmacy/medicines/")
      .then((res) => setMedicines(res.data || []))
      .catch((err) => {
        console.error(err);
        alert("Failed to load medicines");
      });
  }, [consultationId]);

  // Map prescriptions -> items once both loaded
  useEffect(() => {
    if (!consultation || medicines.length === 0) return;

    const initial = (consultation.prescriptions || []).map((p) => {
      const match = medicines.find(
        (m) => m.name.toLowerCase() === p.medicine_name.toLowerCase()
      );
      return {
        prescriptionName: p.medicine_name,
        medicineId: match ? match.id : "",
        quantity: Number(p.quantity || 1),
      };
    });

    setItems(initial);
    setItemMessages({});
  }, [consultation, medicines]);

  // helpers
  const findMedById = (id) =>
    medicines.find((m) => m.id === Number(id));

  const calcSubtotal = (it) => {
    const med = findMedById(it.medicineId);
    if (!med) return 0;
    return (Number(med.unit_price) || 0) * (it.quantity || 1);
  };

  const totalAmount = items.reduce((sum, it) => sum + calcSubtotal(it), 0);

  // Validate a single item (update itemMessages accordingly)
  const validateItem = (index, item) => {
    const med = findMedById(item.medicineId);
    const messages = { ...itemMessages };

    // default clear
    delete messages[index];

    if (!item.medicineId) {
      messages[index] = "Select a medicine.";
    } else if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      messages[index] = "Quantity must be at least 1.";
    } else if (med && typeof med.stock_quantity === "number" && item.quantity > med.stock_quantity) {
      messages[index] = `Requested exceeds stock (${med.stock_quantity}). Adjusted to available.`;
    }

    setItemMessages(messages);
    return messages[index] || "";
  };

  // Update medicine selection for an item
  const updateItemMed = (index, medId) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, medicineId: medId } : it))
    );

    // small delay to let state update then validate (or validate based on new med)
    setTimeout(() => {
      const it = (items[index] && { ...items[index], medicineId: medId }) || { medicineId: medId, quantity: 1 };
      const med = findMedById(medId);
      // auto-cap quantity if present and > stock
      if (med && it.quantity > med.stock_quantity) {
        setItems((prev) =>
          prev.map((it2, i2) =>
            i2 === index ? { ...it2, quantity: med.stock_quantity } : it2
          )
        );
        validateItem(index, { ...it, quantity: med.stock_quantity });
      } else {
        validateItem(index, it);
      }
    }, 0);
  };

  // Update quantity for an item (with clamping)
  const updateItemQty = (index, qtyRaw) => {
    let qty = parseInt(qtyRaw || "0", 10);
    if (Number.isNaN(qty)) qty = 0;
    if (qty < 0) qty = 0;

    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, quantity: qty } : it))
    );

    // validate + clamp if needed
    const med = findMedById(items[index]?.medicineId);
    if (med && qty > med.stock_quantity) {
      // clamp the quantity to available stock and inform user
      setItems((prev) =>
        prev.map((it, i) =>
          i === index ? { ...it, quantity: med.stock_quantity } : it
        )
      );
      setItemMessages((prev) => ({
        ...prev,
        [index]: `Quantity adjusted to available stock (${med.stock_quantity}).`,
      }));
    } else {
      // clear message if it's valid now
      setItemMessages((prev) => {
        const copy = { ...prev };
        delete copy[index];
        return copy;
      });
    }
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setItemMessages((prev) => {
      const copy = { ...prev };
      // shift messages: recompute is simpler
      delete copy[index];
      return copy;
    });
  };

  // Extra item handlers (same validation rules)
  const addExtraItem = () => {
    if (!extraItem.medicineId) {
      setExtraItem((p) => ({ ...p, message: "Select a medicine to add." }));
      return;
    }
    const med = findMedById(extraItem.medicineId);
    let qty = Number(extraItem.quantity || 1);
    if (!Number.isInteger(qty) || qty <= 0) qty = 1;

    if (med && qty > med.stock_quantity) {
      // clamp and show message
      qty = med.stock_quantity;
      setExtraItem((p) => ({
        ...p,
        quantity: qty,
        message: `Quantity adjusted to available stock (${med.stock_quantity}).`,
      }));
    } else {
      setExtraItem((p) => ({ ...p, message: "" }));
    }

    setItems((prev) => [
      ...prev,
      {
        prescriptionName: "(Extra)",
        medicineId: extraItem.medicineId,
        quantity: qty,
      },
    ]);

    // clear extra item form
    setExtraItem({ medicineId: "", quantity: 1, message: "" });
    setItemMessages({});
  };

  // Validate all items before sending to backend
  const validateAll = () => {
    const messages = {};
    items.forEach((it, idx) => {
      const med = findMedById(it.medicineId);
      if (!it.medicineId) {
        messages[idx] = "Select a medicine.";
      } else if (!Number.isInteger(it.quantity) || it.quantity <= 0) {
        messages[idx] = "Quantity must be at least 1.";
      } else if (med && it.quantity > med.stock_quantity) {
        messages[idx] = `Requested exceeds stock (${med.stock_quantity}).`;
      }
    });
    setItemMessages(messages);
    return Object.keys(messages).length === 0;
  };

  const anyInvalid = useMemo(() => {
    // invalid if there is any message present OR if any item missing medicine or qty invalid
    if (items.length === 0) return true;
    if (Object.keys(itemMessages).length > 0) return true;
    for (const it of items) {
      if (!it.medicineId) return true;
      if (!Number.isInteger(it.quantity) || it.quantity <= 0) return true;
      const med = findMedById(it.medicineId);
      if (med && it.quantity > med.stock_quantity) return true;
    }
    return false;
  }, [items, itemMessages, medicines]);

  // Finalize sale: run validation again, then post
  const finalizeSale = async () => {
    if (!validateAll()) {
      alert("Please fix the highlighted errors before generating the bill.");
      return;
    }

    const validItems = items.filter((it) => it.medicineId && it.quantity > 0);

    if (validItems.length === 0) {
      alert("No valid items to dispense");
      return;
    }

    const payload = {
      consultation_id: Number(consultationId),
      items: validItems.map((it) => ({
        medicine: it.medicineId,
        quantity: it.quantity,
      })),
    };

    try {
      const res = await API.post("/pharmacy/create-sale/", payload);
      alert("Medicines dispensed and bill generated!");
      navigate(`/pharmacy/bill/${res.data.id}`);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data ||
        "Error creating sale";
      alert(msg);
    }
  };

  if (!consultation) return <p>Loading...</p>;

  return (
    <div className="main-container">
      <Sidebar role="PHARMACIST" />
      <div className="content">
        <TopBar title="Dispense Medicines" />

        {/* Patient + doctor info */}
        <section className="card">
          <h3>Patient Details</h3>
          <p>
            <b>Name:</b> {consultation.patient_name}
          </p>
          <p>
            <b>Patient ID:</b> {consultation.patient_id}
          </p>
          <p>
            <b>Doctor:</b> {consultation.doctor_name}
          </p>
          <p>
            <b>Diagnosis:</b> {consultation.diagnosis || "—"}
          </p>
        </section>

        {/* Items table */}
        <section className="card">
          <h3>Items to Dispense</h3>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Prescription</th>
                <th>Medicine (Stock)</th>
                <th>Available Qty</th>
                <th>Qty to Give</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No items
                  </td>
                </tr>
              )}

              {items.map((it, i) => {
                const med = findMedById(it.medicineId);
                const msg = itemMessages[i];

                return (
                  <tr key={i}>
                    <td>{it.prescriptionName}</td>
                    <td>
                      <select
                        value={it.medicineId}
                        onChange={(e) => updateItemMed(i, e.target.value)}
                      >
                        <option value="">Select Medicine</option>
                        {medicines.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{med ? med.stock_quantity : "-"}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={it.quantity}
                        onChange={(e) => updateItemQty(i, e.target.value)}
                        style={{
                          width: "70px",
                          border:
                            msg && msg.toLowerCase().includes("adjusted")
                              ? "1px solid #f1c40f"
                              : msg
                              ? "1px solid #e74c3c"
                              : undefined,
                        }}
                      />
                    </td>
                    <td>{med ? Number(med.unit_price).toFixed(2) : "-"}</td>
                    <td>{calcSubtotal(it).toFixed(2)}</td>
                    <td>
                      <button className="btn-danger" onClick={() => removeItem(i)}>
                        X
                      </button>
                    </td>
                    {/* Inline message row */}
                    <tr>
                      <td colSpan="7" style={{ padding: 0, border: "none" }}>
                        {msg && (
                          <div
                            style={{
                              color: msg.toLowerCase().includes("adjusted") ? "#a67c00" : "#c0392b",
                              fontSize: "0.9rem",
                              padding: "6px 12px",
                            }}
                          >
                            {msg}
                          </div>
                        )}
                      </td>
                    </tr>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* Extra medicine add */}
        <section className="card">
          <h3>Add Extra Medicine</h3>
          <div className="prescription-row" style={{ alignItems: "center", gap: 12 }}>
            <select
              value={extraItem.medicineId}
              onChange={(e) =>
                setExtraItem((prev) => ({
                  ...prev,
                  medicineId: e.target.value,
                  message: "",
                }))
              }
            >
              <option value="">Select Medicine</option>
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              value={extraItem.quantity}
              onChange={(e) =>
                setExtraItem((prev) => ({
                  ...prev,
                  quantity: parseInt(e.target.value || "1", 10),
                  message: "",
                }))
              }
              style={{ width: "80px" }}
            />

            <button className="btn-primary" onClick={addExtraItem}>
              Add
            </button>
          </div>

          {extraItem.message && (
            <div style={{ marginTop: 8, color: "#a67c00" }}>{extraItem.message}</div>
          )}
        </section>

        {/* Total + finalize */}
        <section className="card" style={{ textAlign: "right" }}>
          <h3>Total Amount: ₹ {totalAmount.toFixed(2)}</h3>
          <button
            className="btn-success finish-btn"
            onClick={finalizeSale}
            disabled={anyInvalid}
            title={anyInvalid ? "Fix validation errors before finalising" : "Generate bill & dispense"}
            style={{
              opacity: anyInvalid ? 0.6 : 1,
              cursor: anyInvalid ? "not-allowed" : "pointer",
            }}
          >
            Generate Bill & Dispense
          </button>
          {anyInvalid && (
            <div style={{ color: "#c0392b", marginTop: 8, textAlign: "left" }}>
              Please fix highlighted errors (empty medicine, invalid quantity or exceeding stock).
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
