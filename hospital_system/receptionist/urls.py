from django.urls import path
from .views import DepartmentListView, DoctorListByDepartmentView

urlpatterns = [
    path("departments/", DepartmentListView.as_view()),
    path("doctors/by-department/<int:department_id>/", DoctorListByDepartmentView.as_view()),
]
