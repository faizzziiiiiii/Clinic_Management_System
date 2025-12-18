# doctor/views.py
from django.db import transaction
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action

from admin_panel.permissions import IsDoctor
from receptionist.models import Appointment, Patient
from .models import Consultation
from .serializers import (
    DoctorAppointmentSerializer,
    ConsultationSerializer,
    DoctorPatientSerializer,
    PatientHistorySerializer,
    ConsultationShortSerializer,
    DoctorProfileSerializer,
    ConsultationListSerializer,
)

from labtech.models import LabTestRequest
from labtech.serializers import LabTestRequestSerializer


# =======================
# Doctor Appointments
# =======================
class DoctorAppointmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DoctorAppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctor]

    def get_queryset(self):
        return Appointment.objects.filter(
            doctor=self.request.user,
            status__in=["PENDING", "IN_PROGRESS"]
        ).order_by("token_number")

    @action(detail=False, methods=["get"])
    def current(self, request):
        appt = self.get_queryset().first()
        if not appt:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(self.get_serializer(appt).data)

    @action(detail=False, methods=["get"])
    def upcoming(self, request):
        qs = self.get_queryset()[1:]
        return Response(self.get_serializer(qs, many=True).data)


# =======================
# Consultation Create + Lab Request Auto-Create
# =======================
class ConsultationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsDoctor]

    def get_serializer_class(self):
        if self.action == "list":
            return ConsultationListSerializer
        return ConsultationSerializer

    def get_queryset(self):
        return Consultation.objects.filter(doctor=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        consultation = self.get_object()
        serializer = ConsultationSerializer(consultation)
        return Response(serializer.data)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        appointment_id = request.query_params.get("appointment_id")
        if not appointment_id:
            return Response({"detail": "appointment_id required"}, status=400)

        try:
            appt = Appointment.objects.get(id=appointment_id, doctor=request.user)
        except Appointment.DoesNotExist:
            return Response({"detail": "Not your appointment"}, status=404)

        if hasattr(appt, "consultation"):
            return Response({"detail": "Consultation already exists"}, status=400)

        serializer = self.get_serializer(
            data=request.data,
            context={"request": request, "appointment": appt}
        )
        serializer.is_valid(raise_exception=True)
        consultation = serializer.save()

        # Auto-create lab request if doctor selected test
        refer_to_lab = request.data.get("refer_to_lab")
        test_type = request.data.get("test_type")

        if refer_to_lab and test_type:
            if not hasattr(appt, "lab_request"):
                LabTestRequest.objects.create(
                    appointment=appt,
                    doctor=request.user,
                    patient=appt.patient,
                    test_type=test_type,
                    status="PENDING"
                )

        # Mark appointment complete
        appt.status = "COMPLETED"
        appt.save(update_fields=["status"])

        return Response(self.get_serializer(consultation).data, status=201)


# =======================
# Doctor Patients List
# =======================
class DoctorPatientsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DoctorPatientSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctor]

    def get_queryset(self):
        return Patient.objects.filter(
            appointments__doctor=self.request.user,
            appointments__status="COMPLETED"
        ).distinct()


# =======================
# Doctor Patient History View
# =======================
class PatientHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsDoctor]

    def get(self, request, patient_id):
        try:
            patient = Patient.objects.get(id=patient_id)
        except Patient.DoesNotExist:
            return Response({"detail": "Patient not found"}, status=404)

        consultations = Consultation.objects.filter(
            patient=patient,
            doctor=request.user
        ).order_by("-created_at")

        data = PatientHistorySerializer(patient).data
        data["consultations"] = ConsultationShortSerializer(
            consultations, many=True
        ).data

        return Response(data)


# =======================
# Doctor Profile
# =======================
class DoctorProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsDoctor]

    def get(self, request):
        return Response(DoctorProfileSerializer(request.user).data)


# =======================
# Doctor View Lab Requests Sent
# =======================
class DoctorLabRequestsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsDoctor]

    def get(self, request):
        doctor = request.user
        requests = LabTestRequest.objects.filter(doctor=doctor).select_related("patient", "doctor")
        serializer = LabTestRequestSerializer(requests, many=True)
        return Response(serializer.data)

    def post(self, request):
        appointment_id = request.query_params.get("appointment_id")
        test_type = request.data.get("test_type")

        if not appointment_id or not test_type:
            return Response({"detail": "appointment_id and test_type required"}, status=400)

        try:
            appointment = Appointment.objects.get(id=appointment_id)
        except Appointment.DoesNotExist:
            return Response({"error": "Appointment not found"}, status=404)

        LabTestRequest.objects.create(
            appointment=appointment,
            doctor=request.user,
            patient=appointment.patient,
            test_type=test_type,
            status="PENDING"
        )

        return Response({"message": "Lab request sent"}, status=201)


# =======================
# Doctor View Lab Results Received (list)
# =======================
class DoctorLabResultsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsDoctor]

    def get(self, request):
        # Correct filtering: lab requests assigned to this doctor (LabTestRequest.doctor)
        requests = (
            LabTestRequest.objects
            .filter(doctor=request.user, status="COMPLETED")
            .select_related("patient", "doctor", "appointment")
            .order_by("-requested_at")
        )
        serializer = LabTestRequestSerializer(requests, many=True)
        return Response(serializer.data, status=200)


# =======================
# Doctor Lab Result Detail
# =======================
from rest_framework.permissions import IsAuthenticated

class DoctorLabResultDetailView(APIView):
    permission_classes = [IsAuthenticated, IsDoctor]

    def get(self, request, request_id):
        try:
            # Correct filter: match LabTestRequest.doctor to the logged-in doctor
            lab_request = LabTestRequest.objects.get(
                id=request_id,
                doctor=request.user,
                status="COMPLETED",
            )
        except LabTestRequest.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        serializer = LabTestRequestSerializer(lab_request)
        return Response(serializer.data, status=200)
