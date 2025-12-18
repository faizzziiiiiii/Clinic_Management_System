from django.utils.timezone import now
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from admin_panel.permissions import IsLabTechnician, IsDoctor

from .models import LabTestRequest, LabTestResult, LabTestType, Bill
from .serializers import (
    LabTestRequestSerializer,
    LabTestResultSerializer,
    BillSerializer,
)


class PendingLabRequestsView(viewsets.ReadOnlyModelViewSet):
    serializer_class = LabTestRequestSerializer
    permission_classes = [IsAuthenticated, IsLabTechnician]
    queryset = LabTestRequest.objects.filter(status="PENDING")
    lookup_field = "id"


class CompletedLabRequestsView(viewsets.ReadOnlyModelViewSet):
    serializer_class = LabTestRequestSerializer
    permission_classes = [IsAuthenticated, IsLabTechnician]
    queryset = LabTestRequest.objects.filter(status="COMPLETED")
    lookup_field = "id"


class ProcessLabRequestView(viewsets.ModelViewSet):
    """
    POST /lab/process/?request_id=<id>
    Body: { "result_details": "<JSON string>" }

    - Saves LabTestResult
    - Marks LabTestRequest as COMPLETED
    - AUTO generates Bill using LabTestType price
    """
    serializer_class = LabTestResultSerializer
    permission_classes = [IsAuthenticated, IsLabTechnician]

    def get_queryset(self):
        return LabTestResult.objects.all()

    def create(self, request, *args, **kwargs):
        request_id = request.query_params.get("request_id")

        if not request_id:
            return Response({"detail": "request_id is required"}, status=400)

        try:
            lab_request = LabTestRequest.objects.get(
                id=request_id, status="PENDING"
            )
        except LabTestRequest.DoesNotExist:
            return Response(
                {"detail": "Invalid or already processed request."},
                status=404,
            )

        data = request.data.copy()
        data["lab_request"] = request_id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        result = serializer.save(technician=request.user)

        # Update lab request to COMPLETED
        lab_request.status = "COMPLETED"
        lab_request.processed_at = now()
        lab_request.save(update_fields=["status", "processed_at"])

        # AUTO BILLING
        test_type_obj = LabTestType.objects.filter(
            name=lab_request.test_type
        ).first()
        price = test_type_obj.price if test_type_obj else 0

        bill = Bill.objects.create(
            patient=lab_request.patient,
            amount=price,
            description=f"Lab Test: {lab_request.test_type}",
            reference_id=result.id,
            created_by=request.user,
        )

        # Link result to bill
        result.bill = bill
        result.save(update_fields=["bill"])

        return Response(
            {
                "message": "Result saved & Bill generated!",
                "result_id": result.id,
                "bill_id": bill.id,
            },
            status=status.HTTP_201_CREATED,
        )


class LabBillingListView(viewsets.ReadOnlyModelViewSet):
    serializer_class = BillSerializer
    permission_classes = [IsAuthenticated, IsLabTechnician]

    def get_queryset(self):
        return Bill.objects.all().order_by("-created_at")


class LabResultDetailView(viewsets.ReadOnlyModelViewSet):
    serializer_class = LabTestRequestSerializer
    permission_classes = [IsAuthenticated, IsDoctor | IsLabTechnician]
    queryset = LabTestRequest.objects.filter(status="COMPLETED")
    lookup_field = "id"
