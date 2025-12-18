from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, Department


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        (
            "Hillcrest Info",
            {
                "fields": (
                    "role",
                    "gender",
                    "age",
                    "contact_number",
                    "department",
                )
            },
        ),
    )
    list_display = ("username", "first_name", "last_name", "role", "department")


admin.site.register(Department)
