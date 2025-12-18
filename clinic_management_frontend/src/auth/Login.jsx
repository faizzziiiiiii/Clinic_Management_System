import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/api";
import logo from "../assets/hillcrest.jpg";
import "./Login.css"; // ← make sure this exists

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedRole = location.state?.role || "LOGIN";

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (localStorage.getItem("accessDenied") === "true") {
      setErrorMsg("❌ Access Denied! Please login using the correct role.");
      localStorage.removeItem("accessDenied");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("login/", form);
      const { access, refresh, user } = res.data;

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("user", JSON.stringify(user));

      switch (user.role) {
        case "ADMIN":
          navigate("/admin", { replace: true });
          break;
        case "RECEPTIONIST":
          navigate("/receptionist", { replace: true });
          break;
        case "DOCTOR":
          navigate("/doctor", { replace: true });
          break;
        case "LAB_TECHNICIAN":
          navigate("/lab", { replace: true });
          break;
        case "PHARMACIST":
          navigate("/pharmacy", { replace: true });
          break;
        default:
          setError("Role not assigned");
      }
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="login-page">
      {/* Header */}
      <header className="login-header">
        <img src={logo} className="login-logo" alt="Hillcrest Logo" />
        <h1 className="login-hospital-title">Hillcrest Medical Pavilion</h1>
      </header>

      {/* Login Card */}
      <div className="login-card">
        <h2 className="login-title">{selectedRole} Login</h2>

        {errorMsg && <div className="alert-box">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <span className="icon">👤</span>
            <input
              name="username"
              type="text"
              placeholder="Enter Username"
              required
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>

          <div className="input-group">
            <span className="icon">🔒</span>
            <input
              name="password"
              type="password"
              placeholder="Enter Password"
              required
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="login-btn" type="submit">
            Login
          </button>
        </form>
      </div>

      {/* Back button below card */}
      <div className="back-container">
        <div className="back-inner">
          <button className="back-btn" onClick={() => navigate("/")}>
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
