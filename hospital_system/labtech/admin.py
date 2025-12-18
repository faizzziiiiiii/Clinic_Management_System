# labtech/admin.py
from django.contrib import admin
from .models import LabTestRequest, LabTestResult, LabTestType, Bill


@admin.register(LabTestRequest)
class LabTestRequestAdmin(admin.ModelAdmin):
    list_display = ("appointment", "test_type", "status", "requested_at")
    list_filter = ("status", "test_type")
    search_fields = ("patient__full_name", "doctor__first_name", "doctor__last_name")


@admin.register(LabTestResult)
class LabTestResultAdmin(admin.ModelAdmin):
    list_display = ("lab_request", "technician", "created_at", "bill")
    search_fields = ("lab_request__patient__full_name",)


@admin.register(LabTestType)
class LabTestTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "price")
    search_fields = ("name",)


@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ("id", "patient", "amount", "description", "created_by", "created_at")
    search_fields = ("patient__full_name", "description")
    list_filter = ("created_at",)
