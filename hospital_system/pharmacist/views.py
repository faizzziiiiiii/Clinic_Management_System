from decimal import Decimal
from django.db import transaction

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from admin_panel.permissions import IsPharmacist
from receptionist.models import Patient
from doctor.models import Consultation

from .models import Medicine, PharmacySale, PharmacySaleItem
from .serializers import (
    MedicineSerializer,
    PharmacySaleSerializer,
    PharmacySaleCreateSerializer,
    ActivePrescriptionSerializer,
)


# ===========================
# Medicines / Stock
# ===========================
class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all().order_by("name")
    serializer_class = MedicineSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsPharmacist()]

    def get_queryset(self):
        qs = super().get_queryset()
        q = self.request.query_params.get("q")
        if q:
            qs = qs.filter(name__icontains=q)
        return qs


# ===========================
# Active prescriptions for pharmacy
# ===========================
class ActivePrescriptionListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsPharmacist]

    def get(self, request):
        consultations = (
            Consultation.objects.filter(prescriptions__isnull=False)
            .exclude(pharmacy_sale__status="DISPENSED")
            .select_related("patient", "doctor")
            .prefetch_related("prescriptions")
            .order_by("-created_at")
            .distinct()
        )

        serializer = ActivePrescriptionSerializer(consultations, many=True)
        return Response(serializer.data, status=200)


class ConsultationForPharmacyView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsPharmacist]

    def get(self, request, consultation_id):
        try:
            consultation = (
                Consultation.objects
                .select_related("patient", "doctor")
                .prefetch_related("prescriptions")
                .get(id=consultation_id)
            )
        except Consultation.DoesNotExist:
            return Response({"detail": "Consultation not found"}, status=404)

        data = ActivePrescriptionSerializer(consultation).data
        return Response(data, status=200)


# ===========================
# Pharmacy Sales (History + Create)
# ===========================
class PharmacySaleViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PharmacySaleSerializer
    permission_classes = [permissions.IsAuthenticated, IsPharmacist]

    def get_queryset(self):
        qs = (
            PharmacySale.objects
            .select_related("patient", "doctor", "consultation")
            .prefetch_related("items__medicine")
            .order_by("-created_at")
        )
        q = self.request.query_params.get("q")
        if q:
            qs = qs.filter(patient__full_name__icontains=q)
        return qs


class CreatePharmacySaleView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsPharmacist]

    @transaction.atomic
    def post(self, request):
        serializer = PharmacySaleCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        consultation = None
        doctor = None
        patient = None

        consultation_id = data.get("consultation_id")
        if consultation_id:
            try:
                consultation = Consultation.objects.select_related(
                    "patient", "doctor"
                ).get(id=consultation_id)
            except Consultation.DoesNotExist:
                return Response({"detail": "Consultation not found"}, status=404)

            if hasattr(consultation, "pharmacy_sale") and consultation.pharmacy_sale.status == "DISPENSED":
                return Response(
                    {"detail": "Prescription already dispensed"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            patient = consultation.patient
            doctor = consultation.doctor

        else:
            patient_id = data.get("patient_id")
            try:
                patient = Patient.objects.get(id=patient_id)
            except Patient.DoesNotExist:
                return Response({"detail": "Patient not found"}, status=404)

        sale = PharmacySale.objects.create(
            patient=patient,
            doctor=doctor,
            consultation=consultation,
            created_by=request.user,
            status="PENDING",
            total_amount=Decimal("0.00"),
        )

        total = Decimal("0.00")

        for item_data in data["items"]:
            med = item_data["medicine"]
            qty = int(item_data["quantity"])

            # VALIDATION
            if qty <= 0:
                return Response(
                    {"detail": f"Invalid quantity selected for {med.name}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if med.stock_quantity < qty:
                return Response(
                    {"detail": f"Not enough stock for {med.name}. Available: {med.stock_quantity}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Deduct stock
            med.stock_quantity -= qty
            med.save(update_fields=["stock_quantity"])

            unit_price = med.unit_price
            subtotal = unit_price * qty

            PharmacySaleItem.objects.create(
                sale=sale,
                medicine=med,
                medicine_name=med.name,
                quantity=qty,
                unit_price=unit_price,
                subtotal=subtotal,
            )

            total += subtotal

        sale.total_amount = total
        sale.status = "DISPENSED"
        sale.save(update_fields=["total_amount", "status"])

        out = PharmacySaleSerializer(sale)
        return Response(out.data, status=201)
