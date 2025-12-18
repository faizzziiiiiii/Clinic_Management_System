# pharmacy/serializers.py
from decimal import Decimal
from rest_framework import serializers

from admin_panel.models import User
from receptionist.models import Patient
from doctor.models import Consultation, PrescriptionItem
from .models import Medicine, PharmacySale, PharmacySaleItem


class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = [
            "id",
            "name",
            "generic_name",
            "description",
            "unit_price",
            "stock_quantity",
            "is_active",
            "created_at",
            "updated_at",
        ]


class PharmacySaleItemSerializer(serializers.ModelSerializer):
    medicine = MedicineSerializer(read_only=True)

    class Meta:
        model = PharmacySaleItem
        fields = [
            "id",
            "medicine",
            "medicine_name",
            "quantity",
            "unit_price",
            "subtotal",
        ]


class PharmacySaleSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)
    patient_id = serializers.CharField(source="patient.patient_id", read_only=True)
    doctor_name = serializers.SerializerMethodField()
    items = PharmacySaleItemSerializer(many=True, read_only=True)

    class Meta:
        model = PharmacySale
        fields = [
            "id",
            "patient",
            "patient_name",
            "patient_id",
            "doctor",
            "doctor_name",
            "consultation",
            "total_amount",
            "status",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "total_amount",
            "status",
            "created_at",
            "updated_at",
        ]

    def get_doctor_name(self, obj):
        if obj.doctor:
            full = f"{obj.doctor.first_name} {obj.doctor.last_name}".strip()
            return full if full else obj.doctor.username
        return ""


class PharmacySaleCreateItemSerializer(serializers.Serializer):
    """
    Used only when creating a sale.
    """
    medicine = serializers.PrimaryKeyRelatedField(
        queryset=Medicine.objects.all()
    )
    quantity = serializers.IntegerField(min_value=1)


class PharmacySaleCreateSerializer(serializers.Serializer):
    """
    Input for creating a sale from pharmacy.
    """
    consultation_id = serializers.IntegerField(required=False)
    patient_id = serializers.IntegerField(required=False)
    items = PharmacySaleCreateItemSerializer(many=True)

    def validate(self, data):
        consultation_id = data.get("consultation_id")
        patient_id = data.get("patient_id")

        if not consultation_id and not patient_id:
            raise serializers.ValidationError(
                "Either consultation_id or patient_id is required."
            )
        return data

    def create(self, validated_data):
        """
        Creation is handled in the view inside a transaction.
        We won't use this create() directly.
        """
        raise NotImplementedError("Use view logic to create PharmacySale")


class ActivePrescriptionItemSerializer(serializers.ModelSerializer):
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


class ActivePrescriptionSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.full_name")
    patient_id = serializers.CharField(source="patient.patient_id")
    doctor_name = serializers.SerializerMethodField()
    prescriptions = ActivePrescriptionItemSerializer(many=True, read_only=True)

    class Meta:
        model = Consultation
        fields = [
            "id",
            "patient_name",
            "patient_id",
            "doctor_name",
            "diagnosis",
            "clinical_notes",
            "created_at",
            "prescriptions",
        ]

    def get_doctor_name(self, obj):
        full = f"{obj.doctor.first_name} {obj.doctor.last_name}".strip()
        return full if full else obj.doctor.username