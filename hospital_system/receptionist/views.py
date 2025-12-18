# receptionist/views.py
from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView

from .models import Patient, Appointment, Bill, Vitals
from .serializers import (
    PatientSerializer,
    AppointmentSerializer,
    BillSerializer,
    DoctorSerializer,
    VitalsSerializer,
    DepartmentSerializer,
)

from admin_panel.models import User, Department
from admin_panel.permissions import IsAdmin
from .permissions import IsReceptionist


# --------- Custom permission (Admin + Receptionist) ----------
class IsReceptionistOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in ["RECEPTIONIST", "ADMIN"]
        )


# ===================== PATIENTS =====================
class PatientViewSet(viewsets.ModelViewSet):
    serializer_class = PatientSerializer
    permission_classes = [IsReceptionistOrAdmin]

    def get_queryset(self):
        """
        Optionally filter by ?phone=<10-digit>
        """
        qs = Patient.objects.all().order_by("-created_at")
        phone = self.request.query_params.get("phone")
        if phone:
            qs = qs.filter(contact_number__iexact=phone)
        return qs


# ===================== APPOINTMENTS =====================
class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related("patient", "doctor", "department").order_by("-created_at")
    serializer_class = AppointmentSerializer
    permission_classes = [IsReceptionist]


# ===================== BILLS =====================
class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.all()
    serializer_class = BillSerializer
    permission_classes = [IsReceptionistOrAdmin]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        appointment_id = data.get("appointment")

        if not appointment_id:
            return Response({"detail": "Appointment ID required"}, status=400)

        try:
            appointment = Appointment.objects.get(id=appointment_id)
        except Appointment.DoesNotExist:
            return Response({"detail": "Appointment not found"}, status=404)

        # Read fee safely
        fee = data.get("consultation_fee")

        # Fix bad/empty/invalid fee values
        if fee in (None, "", "0", 0):
            # Smart default — use doctor's department fee if available
            fee = appointment.department.consultation_fee if hasattr(appointment.department, "consultation_fee") else 300

        try:
            fee = float(fee)
        except:
            fee = 300

        data["consultation_fee"] = fee

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(appointment=appointment)

        return Response(serializer.data, status=201)


# ===================== VITALS =====================
class VitalsViewSet(viewsets.ModelViewSet):
    queryset = Vitals.objects.all()
    serializer_class = VitalsSerializer
    permission_classes = [IsReceptionist]

    def perform_create(self, serializer):
        appointment_id = self.request.query_params.get("appointment_id")
        if not appointment_id:
            raise ValueError("appointment_id is required")

        appointment = Appointment.objects.get(id=appointment_id)
        serializer.save(appointment=appointment)


# ===================== DROPDOWNS =====================

# List all departments for receptionist
class DepartmentListView(ListAPIView):
    queryset = Department.objects.all().order_by("name")
    serializer_class = DepartmentSerializer
    permission_classes = [IsReceptionistOrAdmin]


# List doctors filtered by department for receptionist
class DoctorListByDepartmentView(ListAPIView):
    serializer_class = DoctorSerializer
    permission_classes = [IsReceptionistOrAdmin]

    def get_queryset(self):
        department_id = self.kwargs.get("department_id")
        qs = User.objects.filter(role="DOCTOR")
        if department_id:
            qs = qs.filter(department_id=department_id)
        return qs
