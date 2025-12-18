from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.http import JsonResponse

# ADMIN PANEL
from admin_panel.views import (
    EmployeeViewSet,
    DepartmentViewSet,
    MyTokenObtainPairView,
    CurrentUserView,
    AdminBillListView,
    AdminPatientHistoryView,
)

# RECEPTIONIST
from receptionist.views import (
    PatientViewSet,
    AppointmentViewSet,
    BillViewSet,
    VitalsViewSet,
    DepartmentListView,
    DoctorListByDepartmentView,
)

# DOCTOR
from doctor.views import (
    DoctorAppointmentViewSet,
    ConsultationViewSet,
    DoctorPatientsViewSet,
    PatientHistoryView,
    DoctorProfileView,
    DoctorLabRequestsView,
    DoctorLabResultsView,
    DoctorLabResultDetailView,
)

# LAB
from labtech.views import (
    PendingLabRequestsView,
    CompletedLabRequestsView,
    ProcessLabRequestView,
    LabBillingListView,
)

# PHARMACY
from pharmacist.views import (
    MedicineViewSet,
    PharmacySaleViewSet,
    CreatePharmacySaleView,
    ConsultationForPharmacyView,
    ActivePrescriptionListView,
)

def home(request):
    return JsonResponse({"message": "Welcome to Hillcrest API"})


# ---------------------------------------------------------
# DRF ROUTER
# ---------------------------------------------------------
router = DefaultRouter()

# ADMIN ROUTES
router.register("admin/employees", EmployeeViewSet, basename="admin-employees")
router.register("admin/departments", DepartmentViewSet, basename="admin-departments")

# RECEPTIONIST ROUTES
router.register("receptionist/patients", PatientViewSet, basename="receptionist-patients")
router.register("receptionist/appointments", AppointmentViewSet, basename="receptionist-appointments")
router.register("receptionist/bills", BillViewSet, basename="receptionist-bills")
router.register("receptionist/vitals", VitalsViewSet, basename="receptionist-vitals")

# DOCTOR ROUTES
router.register("doctor/appointments", DoctorAppointmentViewSet, basename="doctor-appointments")
router.register("doctor/consultations", ConsultationViewSet, basename="doctor-consultations")
router.register("doctor/patients", DoctorPatientsViewSet, basename="doctor-patients")

# LAB ROUTES
router.register("lab/pending", PendingLabRequestsView, basename="lab-pending")
router.register("lab/completed", CompletedLabRequestsView, basename="lab-completed")
router.register("lab/process", ProcessLabRequestView, basename="lab-process")

# PHARMACY ROUTES (router endpoints)
router.register("pharmacy/medicines", MedicineViewSet, basename="pharmacy-medicines")
router.register("pharmacy/sales", PharmacySaleViewSet, basename="pharmacy-sales")
router.register("lab/billing", LabBillingListView, basename="lab-billing")


# ---------------------------------------------------------
# URL PATTERNS
# ---------------------------------------------------------
urlpatterns = [
    path("", home),
    path("admin/", admin.site.urls),

    # AUTH
    path("api/login/", MyTokenObtainPairView.as_view()),
    path("api/me/", CurrentUserView.as_view()),

    # ADMIN DATA
    path("api/admin/patient-history/", AdminPatientHistoryView.as_view()),
    path("api/admin/bills/", AdminBillListView.as_view()),

    # RECEPTIONIST DROPDOWNS
    path("api/receptionist/departments/", DepartmentListView.as_view()),
    path(
        "api/receptionist/doctors/by-department/<int:department_id>/",
        DoctorListByDepartmentView.as_view(),
    ),

    # DOCTOR VIEWS
    path("api/doctor/lab-requests/", DoctorLabRequestsView.as_view()),
    path("api/doctor/lab-results/", DoctorLabResultsView.as_view()),

    path(
        "api/doctor/patients/<int:patient_id>/history/",
        PatientHistoryView.as_view(),
    ),

    path(
        "api/doctor/lab-results/<int:request_id>/",
        DoctorLabResultDetailView.as_view(),
    ),

    path("", include(router.urls)),


    # LAB EXTRA URLS
    path("lab/", include("labtech.urls")),

    # ROUTER URLs → /api/<router-endpoints>
    path("api/", include(router.urls)),

    # ---------------------------------------------------------
    # PHARMACY (Custom URL Endpoints)
    # ---------------------------------------------------------

    # Get consultation details for pharmacist

    path(
     "api/pharmacy/active-prescriptions/",
      ActivePrescriptionListView.as_view(),
    ),
    path(
        "api/pharmacy/consultation/<int:consultation_id>/",
        ConsultationForPharmacyView.as_view(),
    ),

    # Dispense & Create sale bill
    path(
        "api/pharmacy/create-sale/",
        CreatePharmacySaleView.as_view(),
    ),

    # DOCTOR PROFILE
    path("api/doctor/profile/", DoctorProfileView.as_view()),
]
