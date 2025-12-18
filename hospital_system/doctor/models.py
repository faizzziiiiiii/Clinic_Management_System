from django.db import models

from admin_panel.models import User
from receptionist.models import Appointment, Patient


class Consultation(models.Model):
    """
    One consultation per appointment.
    Holds notes, refer-to-lab flag, etc.
    """
    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.CASCADE,
        related_name="consultation",
    )
    doctor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="consultations",
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="consultations",
    )
    diagnosis = models.TextField(blank=True)       # 👈 NEW
    clinical_notes = models.TextField(blank=True)
    refer_to_lab = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Consultation for {self.patient.patient_id} ({self.appointment.id})"


class PrescriptionItem(models.Model):
    """
    One row per medicine in a consultation.
    Medicine is text-only for now (no pharmacy FK).
    """
    consultation = models.ForeignKey(
        Consultation,
        on_delete=models.CASCADE,
        related_name="prescriptions",
    )

    medicine_name = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField(default=1)  # 👈 ADD THIS
  # from dropdown in UI
    dosage = models.CharField(max_length=100, blank=True)      # e.g. "500 mg"
    frequency = models.CharField(max_length=100, blank=True)   # e.g. "1-0-1"
    duration = models.CharField(max_length=100, blank=True)    # e.g. "5 days"
    instructions = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.medicine_name} for {self.consultation.patient.patient_id}"


