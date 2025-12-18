from django.contrib import admin
from .models import Patient, Appointment, Bill, Vitals


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    app_label = "admin_panel"
    readonly_fields = ('patient_id',)
    list_display = ('patient_id', 'full_name', 'age', 'gender', 'contact_number')


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    readonly_fields = ('token_number', 'created_at')
    list_display = ('token_number', 'patient', 'doctor', 'department', 'status')
    fields = ('patient', 'doctor', 'department', 'status')


@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ('appointment', 'get_patient', 'consultation_fee', 'created_at')

    def get_patient(self, obj):
        return obj.appointment.patient.full_name

    get_patient.short_description = "Patient"


# ⭐ Added Vitals Admin ⭐
@admin.register(Vitals)
class VitalsAdmin(admin.ModelAdmin):
    list_display = (
        'patient',
        'blood_pressure',
        'heart_rate',
        'oxygen_saturation',
        'height',
        'weight',
        'recorded_at'
    )

    list_filter = ('recorded_at', 'patient')
    search_fields = ('patient__full_name', 'blood_pressure')
    readonly_fields = ('recorded_at',)


