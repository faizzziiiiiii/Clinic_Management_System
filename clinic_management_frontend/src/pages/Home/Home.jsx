import "./Home.css";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/hillcrest.jpg"; // Ensure path correct

export default function Home() {
  const navigate = useNavigate();

  const goToLogin = (role) => navigate("/login", { state: { role } });

  return (
    <div className="home-wrapper">
      
      {/* Navbar */}
      <header className="navbar">
        <div className="nav-left">
          <img src={logo} alt="Hospital Logo" className="hospital-logo" />
          <h2 className="brand-name">Hillcrest Medical Pavilion</h2>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay">
          <h1>Compassionate Care, Advanced Medicine</h1>
          <p>
            Welcome to Hillcrest Medical Pavilion System. Please select your portal below.
          </p>
        </div>
      </section>

      {/* Portals */}
      <div className="portal-section">
        <h2 className="portal-heading">System Portals</h2>

        <div className="portal-grid">
          <div className="portal-card" onClick={() => goToLogin("ADMIN")}>
            <span className="portal-icon">⚙️</span>
            <h3>Admin Portal</h3>
            <p>Hospital staff and department management</p>
          </div>

          <div className="portal-card" onClick={() => goToLogin("RECEPTIONIST")}>
            <span className="portal-icon">💼</span>
            <h3>Receptionist Portal</h3>
            <p>Patient registration & appointment handling</p>
          </div>

          <div className="portal-card" onClick={() => goToLogin("DOCTOR")}>
            <span className="portal-icon">🩺</span>
            <h3>Doctor Portal</h3>
            <p>View patient records & consultations</p>
          </div>

          <div className="portal-card" onClick={() => goToLogin("LAB_TECHNICIAN")}>
            <span className="portal-icon">🔬</span>
            <h3>Lab Portal</h3>
            <p>Test reports & analysis</p>
          </div>

          <div className="portal-card" onClick={() => goToLogin("PHARMACIST")}>
            <span className="portal-icon">💊</span>
            <h3>Pharmacy Portal</h3>
            <p>Inventory and prescription management</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        © {new Date().getFullYear()} Hillcrest Medical Pavilion — All Rights Reserved.
      </footer>
    </div>
  );
}
