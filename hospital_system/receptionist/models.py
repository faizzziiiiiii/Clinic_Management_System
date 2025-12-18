from django.db import models
from admin_panel.models import User, Department


class Patient(models.Model):
    patient_id = models.CharField(max_length=20, unique=True, editable=False)
    full_name = models.CharField(max_length=200)
    age = models.PositiveIntegerField()
    gender = models.CharField(
        max_length=10,
        choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')],
        null=True,
        blank=True
    )
    blood_group = models.CharField(
        max_length=5,
        choices=[
            ('A+', 'A+'), ('A-', 'A-'),
            ('B+', 'B+'), ('B-', 'B-'),
            ('O+', 'O+'), ('O-', 'O-'),
            ('AB+', 'AB+'), ('AB-', 'AB-')
        ],
        null=True,
        blank=True
    )
    contact_number = models.CharField(max_length=15, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.patient_id:
            last = Patient.objects.order_by('id').last()
            if last and last.patient_id.startswith("PT"):
                number = int(last.patient_id[2:]) + 1
                self.patient_id = f"PT{number:04d}"
            else:
                self.patient_id = "PT0001"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.patient_id} - {self.full_name}"

    class Meta:
        app_label = "admin_panel"  #  FORCE DISPLAY UNDER ADMIN_PANEL


class Appointment(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="appointments")
    doctor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={"role": "DOCTOR"},
        related_name="appointments",
    )
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True)
    token_number = models.CharField(max_length=10, editable=False)
    status = models.CharField(
        max_length=20,
        default="Pending",
        choices=[("Pending", "Pending"), ("Completed", "Completed")],
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.token_number:
            count = Appointment.objects.count() + 1
            self.token_number = f"T{count:03d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.token_number} - {self.patient.full_name}"

   


class Bill(models.Model):
    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.CASCADE,
        related_name="bill",
        null=True,
        blank=True
    )
    consultation_fee = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Bill for {self.appointment.patient.patient_id}"

    class Meta:
        app_label = "admin_panel"  # 


class Vitals(models.Model):
    patient = models.ForeignKey(
        "admin_panel.Patient",
        on_delete=models.CASCADE,
        related_name="vitals"
    )
    height = models.CharField(max_length=10, blank=True, null=True)
    weight = models.CharField(max_length=10, blank=True, null=True)
    blood_pressure = models.CharField(max_length=20, blank=True, null=True)
    heart_rate = models.IntegerField(blank=True, null=True)
    oxygen_saturation = models.IntegerField(blank=True, null=True)
    recorded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Vitals for {self.patient.full_name}"
