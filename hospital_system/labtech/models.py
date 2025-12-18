# labtech/models.py
from django.db import models
from admin_panel.models import User
from receptionist.models import Patient, Appointment


class LabTestType(models.Model):
    """
    Master table for test names and prices.
    Example rows:
      name = "CBC", price = 350
      name = "Lipid Profile", price = 800
    """
    name = models.CharField(max_length=100, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.name} - ₹{self.price}"


class LabTestRequest(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("PROCESSING", "Processing"),
        ("COMPLETED", "Completed"),
    ]

    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.CASCADE,
        related_name="lab_request",
    )

    doctor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="lab_requests",
        null=True,
        blank=True
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="lab_requests",
        null=True,
        blank=True
    )

    test_type = models.CharField(max_length=100)
    remarks = models.TextField(blank=True, null=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING"
    )

    requested_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        p_name = self.patient.full_name if self.patient else "Unknown"
        return f"{self.test_type} for {p_name}"


class Bill(models.Model):
    """
    Lab billing model – lives inside labtech app.
    Will be visible in Django admin (Accounts) and via API.
    """
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="lab_bills"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255)

    # Link back to LabTestResult by id (also have reverse from LabTestResult.bill)
    reference_id = models.PositiveIntegerField(null=True, blank=True)

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_lab_bills"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Bill #{self.id} - {self.patient.full_name}"


class LabTestResult(models.Model):
    lab_request = models.OneToOneField(
        LabTestRequest,
        on_delete=models.CASCADE,
        related_name="result"
    )
    result_details = models.TextField()
    technician = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        limit_choices_to={"role": "LAB_TECHNICIAN"}
    )
    result_file = models.FileField(upload_to="lab_reports/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Link to bill created for this result
    bill = models.OneToOneField(
        Bill,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="lab_result"
    )

    def __str__(self):
        return f"Result - {self.lab_request}"
