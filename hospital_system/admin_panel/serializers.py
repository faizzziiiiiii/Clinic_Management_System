from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
# admin_panel/serializers.py
from .models import User, Department
from receptionist.models import Appointment, Bill


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ["id", "name"]


class EmployeeListSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "role",
            "gender",
            "age",
            "contact_number",
            "email",
            "department_name",
        ]


class EmployeeCreateSerializer(serializers.ModelSerializer):
    # full name as single field in UI
    full_name = serializers.CharField(write_only=True)
    generated_username = serializers.CharField(read_only=True)
    generated_password = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "gender",
            "age",
            "contact_number",
            "email",
            "role",
            "department",
            "generated_username",
            "generated_password",
        ]

    def create(self, validated_data):
        full_name = validated_data.pop("full_name").strip()
        role = validated_data["role"]

        # split name into first + last
        parts = full_name.split(" ", 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ""

        # username/password prefixes
        prefix_map = {
            "DOCTOR": "doc",
            "RECEPTIONIST": "recp",
            "PHARMACIST": "pharm",
            "LAB_TECHNICIAN": "lab",
            "ADMIN": "admin",
        }
        prefix = prefix_map.get(role, "user")

        # count existing users of that role to generate next number
        count_for_role = User.objects.filter(role=role).count() + 1
        username = f"{prefix}{count_for_role:03d}"   # doc001, recp001, etc.
        raw_password = f"pass{count_for_role:03d}"   # pass001, ...

        user = User(
            username=username,
            first_name=first_name,
            last_name=last_name,
            **validated_data,
        )
        user.password = make_password(raw_password)
        user.save()

        # stash generated values so we can include them in response
        self._generated_username = username
        self._generated_password = raw_password

        return user

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # include generated credentials in response
        data["generated_username"] = getattr(self, "_generated_username", instance.username)
        data["generated_password"] = getattr(self, "_generated_password", None)
        return data


class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "role"]


# CUSTOM JWT SERIALIZER – adds role & basic user info
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserBasicSerializer(self.user).data
        return data




# ... your existing serializers (DepartmentSerializer, Employee*, MyToken*, etc.)

from rest_framework import serializers
from receptionist.models import Appointment, Bill

class AdminPatientHistorySerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)
    doctor_name = serializers.CharField(source="doctor.get_full_name", read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = Appointment
        fields = ["id", "patient_name", "doctor_name", "department_name", "created_at", "status"]


class AdminBillSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="appointment.patient.full_name", read_only=True)
    doctor_name = serializers.CharField(source="appointment.doctor.get_full_name", read_only=True)
    department_name = serializers.CharField(source="appointment.department.name", read_only=True)
    token_number = serializers.CharField(source="appointment.token_number", read_only=True)

    class Meta:
        model = Bill
        fields = [
            "id",
            "patient_name",
            "doctor_name",
            "department_name",
            "token_number",
            "consultation_fee",
            "created_at",
        ]
