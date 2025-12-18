// src/pages/Pharmacy/StockPage.jsx
import { useEffect, useState } from "react";
import API from "../../api/api";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";

export default function StockPage() {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");

  const [editMed, setEditMed] = useState(null); // currently editing
  const [newMed, setNewMed] = useState({
    name: "",
    generic_name: "",
    unit_price: "",
    stock_quantity: "",
  });

  const loadMedicines = () => {
    const params = search ? { params: { q: search } } : {};
    API.get("/pharmacy/medicines/", params)
      .then((res) => setMedicines(res.data || []))
      .catch((err) => {
        console.error(err);
        alert("Failed to load inventory");
      });
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const startEdit = (med) => {
    setEditMed({
      id: med.id,
      unit_price: med.unit_price,
      stock_quantity: med.stock_quantity,
    });
  };

  const saveEdit = () => {
    if (!editMed) return;
    API.patch(`/pharmacy/medicines/${editMed.id}/`, {
      unit_price: editMed.unit_price,
      stock_quantity: editMed.stock_quantity,
    })
      .then(() => {
        setEditMed(null);
        loadMedicines();
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to update medicine");
      });
  };

  const addMedicine = () => {
    if (!newMed.name || !newMed.unit_price || !newMed.stock_quantity) {
      alert("Name, price and quantity are required");
      return;
    }

    API.post("/pharmacy/medicines/", {
      name: newMed.name,
      generic_name: newMed.generic_name,
      unit_price: newMed.unit_price,
      stock_quantity: newMed.stock_quantity,
    })
      .then(() => {
        setNewMed({
          name: "",
          generic_name: "",
          unit_price: "",
          stock_quantity: "",
        });
        loadMedicines();
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to add medicine");
      });
  };

  return (
    <div className="main-container">
      <Sidebar role="PHARMACIST" />
      <div className="content">
        <TopBar title="Stock / Inventory" />

        {/* Search */}
        <section className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <input
              type="text"
              className="input-box"
              placeholder="Search medicine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: "300px" }}
            />
            <button className="btn-primary" onClick={loadMedicines}>
              Search
            </button>
          </div>

          <table className="styled-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Generic</th>
                <th>Stock Qty</th>
                <th>Unit Price</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {medicines.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No medicines found
                  </td>
                </tr>
              )}

              {medicines.map((m) => {
                const isEditing = editMed && editMed.id === m.id;
                return (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.generic_name || "—"}</td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editMed.stock_quantity}
                          onChange={(e) =>
                            setEditMed((prev) => ({
                              ...prev,
                              stock_quantity: e.target.value,
                            }))
                          }
                          style={{ width: "80px" }}
                        />
                      ) : (
                        m.stock_quantity
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editMed.unit_price}
                          onChange={(e) =>
                            setEditMed((prev) => ({
                              ...prev,
                              unit_price: e.target.value,
                            }))
                          }
                          style={{ width: "100px" }}
                        />
                      ) : (
                        `₹ ${Number(m.unit_price).toFixed(2)}`
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <>
                          <button className="btn-primary" onClick={saveEdit}>
                            Save
                          </button>
                          <button
                            className="btn-danger"
                            style={{ marginLeft: "6px" }}
                            onClick={() => setEditMed(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn-primary"
                          onClick={() => startEdit(m)}
                        >
                          Update
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* Add New Medicine */}
        <section className="card">
          <h3>Add New Medicine</h3>
          <div className="prescription-row">
            <input
              type="text"
              className="input-box"
              placeholder="Medicine name"
              value={newMed.name}
              onChange={(e) =>
                setNewMed((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <input
              type="text"
              className="input-box"
              placeholder="Generic name (optional)"
              value={newMed.generic_name}
              onChange={(e) =>
                setNewMed((prev) => ({
                  ...prev,
                  generic_name: e.target.value,
                }))
              }
            />
            <input
              type="number"
              className="input-box"
              placeholder="Unit price"
              value={newMed.unit_price}
              onChange={(e) =>
                setNewMed((prev) => ({
                  ...prev,
                  unit_price: e.target.value,
                }))
              }
            />
            <input
              type="number"
              className="input-box"
              placeholder="Quantity"
              value={newMed.stock_quantity}
              onChange={(e) =>
                setNewMed((prev) => ({
                  ...prev,
                  stock_quantity: e.target.value,
                }))
              }
            />
            <button className="btn-primary" onClick={addMedicine}>
              Add
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
