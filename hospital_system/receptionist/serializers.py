from rest_framework import serializers
from .models import Patient, Appointment, Bill, Vitals
from admin_panel.models import User, Department


# ───────────────────────────────────────
# Doctor Serializer
# ───────────────────────────────────────
class DoctorSerializer(serializers.ModelSerializer):
    department = serializers.IntegerField(source="department.id", read_only=True)

    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "department"]


# ───────────────────────────────────────
# Department Serializer
# ───────────────────────────────────────
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ["id", "name"]


# ───────────────────────────────────────
# Patient Serializer
# ───────────────────────────────────────
class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
            "id",
            "patient_id",
            "full_name",
            "age",
            "gender",
            "contact_number",
            "blood_group",
            "address",
            "created_at",
        ]
        read_only_fields = ["id", "patient_id", "created_at"]


# ───────────────────────────────────────
# Appointment Serializer
# ───────────────────────────────────────
class AppointmentSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)
    doctor = DoctorSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient",
            "doctor",
            "department",
            "token_number",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "token_number", "status", "created_at"]

    def create(self, validated_data):
        request = self.context['request']
        patient_id = request.data.get("patient")
        doctor_id = request.data.get("doctor")
        department_id = request.data.get("department")

        validated_data["patient"] = Patient.objects.get(id=patient_id)
        validated_data["doctor"] = User.objects.get(id=doctor_id)
        validated_data["department"] = Department.objects.get(id=department_id)

        # Generate token number
        count = Appointment.objects.count() + 1
        validated_data["token_number"] = f"T{count:03d}"

        return super().create(validated_data)


# ───────────────────────────────────────
# Bill Serializer
# ───────────────────────────────────────
class BillSerializer(serializers.ModelSerializer):
    patient = serializers.CharField(source='appointment.patient.patient_id', read_only=True)
    patient_name = serializers.CharField(source='appointment.patient.full_name', read_only=True)
    doctor_name = serializers.SerializerMethodField()
    department_name = serializers.CharField(source='appointment.department.name', read_only=True)
    token_number = serializers.CharField(source='appointment.token_number', read_only=True)

    class Meta:
        model = Bill
        fields = [
            "id",
            "appointment",
            "patient",
            "patient_name",
            "doctor_name",
            "department_name",
            "token_number",
            "consultation_fee",
            "created_at",
        ]

        # ❗ Only these should be read-only
        read_only_fields = [
            "id",
            "patient",
            "patient_name",
            "doctor_name",
            "department_name",
            "token_number",
            "created_at",
        ]

    def validate(self, attrs):
        fee = attrs.get("consultation_fee")
        if fee in (None, "", 0, "0"):
            fee = 300  # Default fallback
        attrs["consultation_fee"] = fee
        return attrs

    def get_doctor_name(self, obj):
        doc = obj.appointment.doctor
        name = f"{doc.first_name} {doc.last_name}".strip()
        return name or "Doctor"



# ───────────────────────────────────────
# Vitals Serializer
# ───────────────────────────────────────
class VitalsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vitals
        fields = [
            "id",
            "height",
            "weight",
            "blood_pressure",
            "heart_rate",
            "oxygen_saturation",
            "recorded_at",
        ]
