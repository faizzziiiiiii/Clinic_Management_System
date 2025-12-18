from django.contrib import admin
from .models import Consultation, PrescriptionItem


class PrescriptionInline(admin.TabularInline):
    model = PrescriptionItem
    extra = 0


@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = ("id", "patient", "doctor", "appointment", "refer_to_lab", "created_at")
    inlines = [PrescriptionInline]


