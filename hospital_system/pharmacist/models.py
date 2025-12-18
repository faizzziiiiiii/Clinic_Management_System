# pharmacy/models.py
from django.db import models
from decimal import Decimal

from admin_panel.models import User
from receptionist.models import Patient
from doctor.models import Consultation


class Medicine(models.Model):
    name = models.CharField(max_length=200, unique=True)
    generic_name = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class PharmacySale(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("DISPENSED", "Dispensed"),
    ]

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="pharmacy_sales",
    )
    doctor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="pharmacy_sales",
    )
    consultation = models.OneToOneField(
        Consultation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="pharmacy_sale",
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="pharmacy_sales_created",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="DISPENSED",
    )
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Pharmacy Sale #{self.id} - {self.patient.patient_id}"
    

class PharmacySaleItem(models.Model):
    sale = models.ForeignKey(
        PharmacySale,
        on_delete=models.CASCADE,
        related_name="items",
    )
    medicine = models.ForeignKey(
        Medicine,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sale_items",
    )
    medicine_name = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.medicine_name} x {self.quantity} (Sale #{self.sale_id})"
