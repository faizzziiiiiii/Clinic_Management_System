from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MedicineViewSet,
    PharmacySaleViewSet,
    ActivePrescriptionListView,
    ConsultationForPharmacyView,
    CreatePharmacySaleView
)

router = DefaultRouter()
router.register("medicines", MedicineViewSet, basename="medicines")
router.register("sales", PharmacySaleViewSet, basename="pharmacy-sales")

urlpatterns = [
    path("", include(router.urls)),
    path("active-prescriptions/", ActivePrescriptionListView.as_view(), name="active-prescriptions"),
    path("consultation/<int:consultation_id>/", ConsultationForPharmacyView.as_view(), name="consultation-for-pharmacy"),
    path("create-sale/", CreatePharmacySaleView.as_view(), name="create-pharmacy-sale"),
]
