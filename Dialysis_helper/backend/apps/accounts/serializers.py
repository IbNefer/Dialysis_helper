from rest_framework import serializers

from .models import Role, User, Doctor, Patient


class RoleSerializer(serializers.ModelSerializer):

    class Meta:
        model = Role
        fields = [
            "id",
            "codigo",
            "nombre",
            "descripcion",
            "activo",
        ]


class DoctorProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = Doctor
        fields = [
            "id",
            "especialidad",
            "centro",
        ]


class PatientProfileSerializer(serializers.ModelSerializer):

    doctor = DoctorProfileSerializer(read_only=True)

    class Meta:
        model = Patient
        fields = [
            "id",
            "fecha_nacimiento",
            "activo",
            "doctor",
        ]


class UserMeSerializer(serializers.ModelSerializer):

    rol = RoleSerializer(read_only=True)

    perfil_doctor = serializers.SerializerMethodField()

    perfil_paciente = serializers.SerializerMethodField()

    class Meta:
        model = User

        fields = [
            "id",
            "correo",
            "nombre",
            "telefono",
            "rol",
            "activo",
            "mfa_activo",
            "perfil_doctor",
            "perfil_paciente",
        ]

        read_only_fields = [
            "id",
            "correo",
            "rol",
            "activo",
            "mfa_activo",
            "perfil_doctor",
            "perfil_paciente",
        ]

    def validate_nombre(self, value):

        if not value.strip():
            raise serializers.ValidationError(
                "El nombre no puede estar vacío."
            )

        return value.strip()

    def get_perfil_doctor(self, obj):

        try:
            return DoctorProfileSerializer(
                obj.perfil_doctor
            ).data

        except Doctor.DoesNotExist:
            return None

    def get_perfil_paciente(self, obj):

        try:
            return PatientProfileSerializer(
                obj.perfil_paciente
            ).data

        except Patient.DoesNotExist:
            return None