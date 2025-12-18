from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.generics import ListAPIView

from admin_panel.permissions import IsAdmin, IsDoctor, IsReceptionist
from receptionist.models import Appointment, Patient
from receptionist.serializers import (
    AppointmentSerializer,
    PatientSerializer,
    DoctorSerializer,
)

from .models import User, Department
from .serializers import (
    EmployeeCreateSerializer,
    EmployeeListSerializer,
    DepartmentSerializer,
    UserBasicSerializer,
    MyTokenObtainPairSerializer,
)

from receptionist.serializers import BillSerializer

# admin_panel/views.py
from rest_framework import generics
from admin_panel.permissions import IsAdmin
from receptionist.models import Appointment, Bill
from .serializers import (
    AdminPatientHistorySerializer,
    AdminBillSerializer,
)


# JWT Login View
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


# Who Am I?
class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserBasicSerializer(request.user)
        return Response(serializer.data)


# ADMIN: Manage Employees
class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = User.objects.exclude(role="ADMIN").order_by("id")
    permission_classes = [IsAdmin]

    def get_serializer_class(self):
        if self.action == "create":
            return EmployeeCreateSerializer
        return EmployeeListSerializer


# ADMIN + RECEPTIONIST: Manage departments
class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all().order_by("name")
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdmin | IsReceptionist]


# DOCTOR: Manage own appointments only
class DoctorAppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsDoctor]

    def get_queryset(self):
        return Appointment.objects.filter(
            doctor=self.request.user
        ).order_by("-created_at")

    def get_serializer(self, *args, **kwargs):
        serializer = super().get_serializer(*args, **kwargs)
        if self.request.method in ("PUT", "PATCH"):
            # Doctor can only update status
            for f in ["patient", "doctor", "department", "token_number", "created_at"]:
                serializer.fields.pop(f, None)
        return serializer


# DOCTOR: View assigned patients only
class DoctorPatientsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PatientSerializer
    permission_classes = [IsDoctor]

    def get_queryset(self):
        return Patient.objects.filter(
            appointments__doctor=self.request.user
        ).distinct()


# Receptionist/Admin: View doctors by department
class DoctorsByDepartmentView(APIView):
    permission_classes = [IsReceptionist | IsAdmin]

    def get(self, request, department_id):
        doctors = User.objects.filter(role="DOCTOR", department_id=department_id)
        serializer = DoctorSerializer(doctors, many=True)
        return Response(serializer.data)




from .serializers import (
    AdminPatientHistorySerializer, 
    AdminBillSerializer
)

class AdminPatientHistoryView(ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminPatientHistorySerializer

    def get_queryset(self):
        # do not over-filter; if you want only completed, use __iexact to be safe
        return (
            Appointment.objects
            .select_related("patient", "doctor", "department")
            .order_by("-created_at")
        )

class AdminBillListView(ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminBillSerializer

    def get_queryset(self):
        return (
            Bill.objects
            .select_related(
                "appointment",
                "appointment__patient",
                "appointment__doctor",
                "appointment__department",
            )
            .order_by("-created_at")
        )