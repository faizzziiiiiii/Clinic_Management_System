from rest_framework import serializers

from admin_panel.models import User
from receptionist.models import Appointment, Patient
from receptionist.serializers import AppointmentSerializer, PatientSerializer

from .models import Consultation, PrescriptionItem


class PrescriptionItemSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(required=True, allow_blank=False)
    dosage = serializers.CharField(required=False, allow_blank=True)
    frequency = serializers.CharField(required=False, allow_blank=True)
    duration = serializers.CharField(required=False, allow_blank=True)
    instructions = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = PrescriptionItem
        fields = [
            "id",
            "medicine_name",
            "quantity",
            "dosage",
            "frequency",
            "duration",
            "instructions",
        ]



class ConsultationSerializer(serializers.ModelSerializer):
    prescriptions = PrescriptionItemSerializer(
        many=True, required=False, allow_null=True
    )

    patient = PatientSerializer(read_only=True)
    appointment = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Consultation
        fields = [
            "id",
            "appointment",
            "doctor",
            "diagnosis",
            "patient",
            "clinical_notes",
            "refer_to_lab",
            "prescriptions",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "doctor",
            "patient",
            "appointment",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        prescriptions_data = validated_data.pop("prescriptions", [])

        appointment = self.context["appointment"]
        doctor = self.context["request"].user
        patient = appointment.patient

        # ❗ FIX: capture diagnosis before it gets removed
        diagnosis = validated_data.pop("diagnosis", "")

        # ❗ FIX: include diagnosis when creating the consultation
        consultation = Consultation.objects.create(
            appointment=appointment,
            doctor=doctor,
            patient=patient,
            diagnosis=diagnosis,
            **validated_data,
        )

        # Create prescription items
        if prescriptions_data:
            for item in prescriptions_data:
                PrescriptionItem.objects.create(
                    consultation=consultation, **item
                )

        return consultation

    def update(self, instance, validated_data):
        prescriptions_data = validated_data.pop("prescriptions", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if prescriptions_data is not None:
            instance.prescriptions.all().delete()
            for item in prescriptions_data:
                PrescriptionItem.objects.create(
                    consultation=instance, **item
                )

        return instance



class DoctorAppointmentSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "token_number",
            "status",
            "created_at",
            "patient",
            "department",
        ]


class DoctorPatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
            "id",
            "patient_id",
            "full_name",
            "age",
            "gender",
            "contact_number",
        ]


class ConsultationShortSerializer(serializers.ModelSerializer):
    prescriptions = PrescriptionItemSerializer(many=True, required=False)

    class Meta:
        model = Consultation
        fields = [
            "id",
            "clinical_notes",
            "refer_to_lab",
            "prescriptions",
            "created_at",
        ]


class PatientHistorySerializer(serializers.ModelSerializer):
    consultations = ConsultationShortSerializer(many=True)

    class Meta:
        model = Patient
        fields = [
            "id",
            "patient_id",
            "full_name",
            "age",
            "gender",
            "consultations",
        ]


class DoctorProfileSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    department_name = serializers.CharField(
        source="department.name", read_only=True, default=""
    )

    class Meta:
        model = User
        fields = ["id", "name", "department_name"]

    def get_name(self, obj):
        if getattr(obj, "full_name", None):
            return obj.full_name
        if getattr(obj, "name", None):
            return obj.name
        if getattr(obj, "first_name", None):
            return f"{obj.first_name} {obj.last_name}".strip()
        return obj.username


class ConsultationListSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)

    class Meta:
        model = Consultation
        fields = ["id", "patient", "diagnosis", "clinical_notes", "created_at"]
