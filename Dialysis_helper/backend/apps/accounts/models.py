from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Usuario del sistema. El rol define a que tiene acceso (RF de control por roles)."""

    class Role(models.TextChoices):
        PACIENTE = "paciente", "Paciente"
        CUIDADOR = "cuidador", "Cuidador"
        DOCTOR = "doctor", "Doctor"
        ADMINISTRADOR = "administrador", "Administrador"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.PACIENTE)
