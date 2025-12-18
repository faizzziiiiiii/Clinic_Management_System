import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";

export default function LabDashboard() {
  return (
    <>
      <Sidebar />
      <TopBar />
      <div className="page-container">
        <h2>Lab Dashboard</h2>
        <p>View and process lab test requests.</p>
      </div>
    </>
  );
}
