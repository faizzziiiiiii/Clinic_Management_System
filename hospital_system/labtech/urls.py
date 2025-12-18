# labtech/urls.py
from django.urls import path
from .views import (
    PendingLabRequestsView,
    CompletedLabRequestsView,
    ProcessLabRequestView,
    LabResultDetailView,
    LabBillingListView,
)

urlpatterns = [
    path("pending/", PendingLabRequestsView.as_view({"get": "list"})),
    path("pending/<int:id>/", PendingLabRequestsView.as_view({"get": "retrieve"})),
    path("completed/", CompletedLabRequestsView.as_view({"get": "list"})),
    path("completed/<int:id>/", LabResultDetailView.as_view({"get": "retrieve"})),
    path("process/", ProcessLabRequestView.as_view({"post": "create"})),

    # 🔥 NEW: Lab billing list for lab technician
    path("billing/", LabBillingListView.as_view({"get": "list"})),
]
