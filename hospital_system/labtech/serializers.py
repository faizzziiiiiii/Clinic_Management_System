# labtech/serializers.py
from rest_framework import serializers
from .models import LabTestRequest, LabTestResult, Bill


class BillSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)

    class Meta:
        model = Bill
        fields = [
            "id",
            "patient_name",
            "amount",
            "description",
            "created_at",
        ]


class LabTestResultSerializer(serializers.ModelSerializer):
    # Proper patient + doctor naming
    patient_name = serializers.CharField(source="lab_request.patient.full_name", read_only=True)
    doctor_name = serializers.CharField(source="lab_request.doctor.full_name", read_only=True)
    bill = BillSerializer(read_only=True)

    class Meta:
        model = LabTestResult
        fields = [
            "id",
            "result_details",
            "created_at",
            "lab_request",
            "patient_name",
            "doctor_name",
            "bill",
        ]
        read_only_fields = ("technician",)
        extra_kwargs = {
            "lab_request": {"required": True},
        }


class LabTestRequestSerializer(serializers.ModelSerializer):
    # Include result so doctor & lab tech can see full details
    result = LabTestResultSerializer(read_only=True)

    patient_name = serializers.CharField(source="patient.full_name", read_only=True)
    doctor_name = serializers.SerializerMethodField(read_only=True)
    requested_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)
    processed_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)

    def get_doctor_name(self, obj):
        if not obj.doctor:
            return ""
        return f"{obj.doctor.first_name} {obj.doctor.last_name}".strip()

    class Meta:
        model = LabTestRequest
        fields = "__all__"
        read_only_fields = ("appointment", "doctor", "patient")
