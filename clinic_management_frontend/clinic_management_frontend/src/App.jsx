import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home/Home";
import Login from "./auth/Login";
import RoleProtectedRoute from "./auth/RoleProtectedRoute";

/* ================= ADMIN ================= */
import AdminDashboard from "./pages/Admin/Dashboard";
import AddEmployee from "./pages/Admin/AddEmployee";
import EmployeesList from "./pages/Admin/EmployeesList";
import AddDepartment from "./pages/Admin/AddDepartment";
import PatientHistory from "./pages/Admin/PatientHistory";
import Accounts from "./pages/Admin/Accounts";
import EditEmployee from "./pages/Admin/EditEmployee";

/* ================= RECEPTIONIST ================= */
import RecepDashboard from "./pages/Receptionist/Dashboard";
import AddPatient from "./pages/Receptionist/AddPatient";
import ExistingAppointment from "./pages/Receptionist/ExistingAppointment";
import PatientsList from "./pages/Receptionist/PatientsList";
import Billing from "./pages/Receptionist/Billing";
import BillingList from "./pages/Receptionist/BillingList";
import EditPatient from "./pages/Receptionist/EditPatient";

/* ================= DOCTOR ================= */
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import ConsultationPage from "./pages/Doctor/ConsultationPage";
import PatientsHistory from "./pages/Doctor/PatientsHistory";
import ConsultationDetails from "./pages/Doctor/ConsultationDetails";
import LabRequestsPage from "./pages/Doctor/LabRequestsPage";
import LabResultsPage from "./pages/Doctor/LabResultsPage";

/* Shared lab report view */
import LabResultViewPage from "./pages/Lab/LabResultViewPage";

/* ================= LAB ================= */
import PendingTestsPage from "./pages/Lab/PendingTestsPage";
import ProcessLabTestPage from "./pages/Lab/ProcessLabTestPage";
import CompletedTestsPage from "./pages/Lab/CompletedTestsPage";
import LabBillingPage from "./pages/Lab/LabBillingPage";
import LabBill from "./pages/Lab/LabBill";

/* ================= PHARMACY ================= */
import PharmacyDashboard from "./pages/Pharmacy/Dashboard";
import ActivePrescriptions from "./pages/Pharmacy/ActivePrescriptions";
import DispensePage from "./pages/Pharmacy/DispensePage";
import PurchaseHistory from "./pages/Pharmacy/PurchaseHistory";
import StockPage from "./pages/Pharmacy/StockPage";
import PharmacyBill from "./pages/Pharmacy/PharmacyBill";  // ✅ Added bill page


export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />


        {/* ================= ADMIN ROUTES ================= */}
        <Route
          path="/admin"
          element={
            <RoleProtectedRoute roles={["ADMIN"]}>
              <AdminDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/add-employee"
          element={
            <RoleProtectedRoute roles={["ADMIN"]}>
              <AddEmployee />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/employees"
          element={
            <RoleProtectedRoute roles={["ADMIN"]}>
              <EmployeesList />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/add-department"
          element={
            <RoleProtectedRoute roles={["ADMIN"]}>
              <AddDepartment />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/patient-history"
          element={
            <RoleProtectedRoute roles={["ADMIN"]}>
              <PatientHistory />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/accounts"
          element={
            <RoleProtectedRoute roles={["ADMIN"]}>
              <Accounts />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/edit-employee/:id"
          element={
            <RoleProtectedRoute roles={["ADMIN"]}>
              <EditEmployee />
            </RoleProtectedRoute>
          }
        />


        {/* ================= RECEPTIONIST ROUTES ================= */}
        <Route
          path="/receptionist"
          element={
            <RoleProtectedRoute roles={["RECEPTIONIST"]}>
              <RecepDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/receptionist/add-patient"
          element={
            <RoleProtectedRoute roles={["RECEPTIONIST"]}>
              <AddPatient />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/receptionist/existing-appointment"
          element={
            <RoleProtectedRoute roles={["RECEPTIONIST"]}>
              <ExistingAppointment />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/receptionist/patients"
          element={
            <RoleProtectedRoute roles={["RECEPTIONIST"]}>
              <PatientsList />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/receptionist/billing"
          element={
            <RoleProtectedRoute roles={["RECEPTIONIST"]}>
              <BillingList />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/receptionist/billing/:billId"
          element={
            <RoleProtectedRoute roles={["RECEPTIONIST"]}>
              <Billing />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/receptionist/edit-patient/:patientid"
          element={
            <RoleProtectedRoute roles={["RECEPTIONIST"]}>
              <EditPatient />
            </RoleProtectedRoute>
          }
        />


        {/* ================= DOCTOR ROUTES ================= */}
        <Route
          path="/doctor"
          element={
            <RoleProtectedRoute roles={["DOCTOR"]}>
              <DoctorDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/doctor/consult/:appointment_id"
          element={
            <RoleProtectedRoute roles={["DOCTOR"]}>
              <ConsultationPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/doctor/history"
          element={
            <RoleProtectedRoute roles={["DOCTOR"]}>
              <PatientsHistory />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/doctor/history/:consultation_id"
          element={
            <RoleProtectedRoute roles={["DOCTOR"]}>
              <ConsultationDetails />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/doctor/lab-requests"
          element={
            <RoleProtectedRoute roles={["DOCTOR"]}>
              <LabRequestsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/doctor/lab-results"
          element={
            <RoleProtectedRoute roles={["DOCTOR"]}>
              <LabResultsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/doctor/lab-results/:requestId"
          element={
            <RoleProtectedRoute roles={["DOCTOR", "LAB_TECHNICIAN"]}>
              <LabResultViewPage />
            </RoleProtectedRoute>
          }
        />


        {/* ================= LAB ROUTES ================= */}
        <Route
          path="/lab"
          element={
            <RoleProtectedRoute roles={["LAB_TECHNICIAN"]}>
              <Navigate to="/lab/pending-tests" replace />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/lab/pending-tests"
          element={
            <RoleProtectedRoute roles={["LAB_TECHNICIAN"]}>
              <PendingTestsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/lab/pending-tests/:requestId"
          element={
            <RoleProtectedRoute roles={["LAB_TECHNICIAN"]}>
              <ProcessLabTestPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/lab/completed-tests"
          element={
            <RoleProtectedRoute roles={["LAB_TECHNICIAN"]}>
              <CompletedTestsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/lab/results/:requestId"
          element={
            <RoleProtectedRoute roles={["DOCTOR", "LAB_TECHNICIAN"]}>
              <LabResultViewPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/lab/billing"
          element={
            <RoleProtectedRoute roles={["LAB_TECHNICIAN"]}>
              <LabBillingPage />
            </RoleProtectedRoute>
          }
        />
        <Route path="/lab/bill/:billId" element={<LabBill />} />



        {/* ================= PHARMACY ROUTES ================= */}
        <Route
          path="/pharmacy"
          element={
            <RoleProtectedRoute roles={["PHARMACIST"]}>
              <PharmacyDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/pharmacy/active-prescriptions"
          element={
            <RoleProtectedRoute roles={["PHARMACIST"]}>
              <ActivePrescriptions />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/pharmacy/dispense/:consultationId"
          element={
            <RoleProtectedRoute roles={["PHARMACIST"]}>
              <DispensePage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/pharmacy/history"
          element={
            <RoleProtectedRoute roles={["PHARMACIST"]}>
              <PurchaseHistory />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/pharmacy/stock"
          element={
            <RoleProtectedRoute roles={["PHARMACIST"]}>
              <StockPage />
            </RoleProtectedRoute>
          }
        />

        {/* 🧾 Pharmacy Bill Page */}
        <Route
          path="/pharmacy/bill/:saleId"
          element={
            <RoleProtectedRoute roles={["PHARMACIST"]}>
              <PharmacyBill />
            </RoleProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
