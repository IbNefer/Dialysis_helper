
import uuid

from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin
)


class Role(models.Model):

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    codigo = models.CharField(
        max_length=30,
        unique=True
    )

    nombre = models.CharField(max_length=50)

    descripcion = models.TextField(
        blank=True,
        null=True
    )

    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

    class Meta:
        db_table = "accounts_role"
        verbose_name = "Rol"
        verbose_name_plural = "Roles"


class UserManager(BaseUserManager):

    def create_user(self, correo, password=None, **extra_fields):

        if not correo:
            raise ValueError("El correo es obligatorio")

        if not password:
            raise ValueError("La contraseña es obligatoria")

        correo = self.normalize_email(correo)

        rol = extra_fields.get("rol")

        if rol is None:
            rol = Role.objects.get(codigo="paciente")
            extra_fields["rol"] = rol

        elif isinstance(rol, str):
            extra_fields["rol"] = Role.objects.get(codigo=rol)

        user = self.model(
            correo=correo,
            **extra_fields
        )

        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, correo, password=None, **extra_fields):

        extra_fields.setdefault(
            "rol",
            Role.objects.get(codigo="administrador")
        )

        extra_fields.setdefault("activo", True)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("El superusuario debe tener is_staff=True")

        if extra_fields.get("is_superuser") is not True:
            raise ValueError("El superusuario debe tener is_superuser=True")

        return self.create_user(correo, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    correo = models.EmailField(
        unique=True,
        max_length=254
    )

    password = models.CharField(
        max_length=128,
        db_column="clave_hash"
    )

    rol = models.ForeignKey(
    Role,
    on_delete=models.PROTECT,
    related_name="usuarios",
    db_column="rol_id"
    )

    nombre = models.CharField(max_length=150)

    telefono = models.CharField(
        max_length=20,
        blank=True
    )

    activo = models.BooleanField(default=True)

    mfa_activo = models.BooleanField(default=False)

    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "correo"
    REQUIRED_FIELDS = ["nombre"]

    @property
    def is_active(self):
        return self.activo

    def __str__(self):
        return self.correo

    class Meta:
        db_table = "accounts_user"
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"


class Doctor(models.Model):

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    usuario = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="perfil_doctor"
    )

    especialidad = models.CharField(max_length=150)

    centro = models.CharField(max_length=150)

    def __str__(self):
        return f"Doctor: {self.usuario.nombre}"

    class Meta:
        db_table = "accounts_doctor"
        verbose_name = "Doctor"
        verbose_name_plural = "Doctores"


class Patient(models.Model):

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    usuario = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="perfil_paciente"
    )

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.SET_NULL,
        related_name="pacientes",
        null=True,
        blank=True
    )

    fecha_nacimiento = models.DateField(
        null=True,
        blank=True
    )

    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"Paciente: {self.usuario.nombre}"

    class Meta:
        db_table = "accounts_patient"
        verbose_name = "Paciente"
        verbose_name_plural = "Pacientes"



class PatientCaregiver(models.Model):

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    paciente = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="cuidadores"
    )

    cuidador = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="pacientes_asignados"
    )

    relacion = models.CharField(max_length=50)

    activo = models.BooleanField(default=True)

    fecha_inicio = models.DateField()

    fecha_fin = models.DateField(
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.cuidador} - {self.paciente}"

    class Meta:
        db_table = "accounts_patient_caregiver"
        verbose_name = "Relación paciente-cuidador"
        verbose_name_plural = "Relaciones paciente-cuidador"
        constraints = [
            models.UniqueConstraint(
                fields=["paciente", "cuidador"],
                name="unique_patient_caregiver"
            )
        ]


class Invitation(models.Model):

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    correo = models.EmailField(max_length=254)

    rol_destino = models.ForeignKey(
        Role,
        on_delete=models.PROTECT,
        related_name="invitaciones"
    )

    codigo_hash = models.CharField(
        max_length=255,
        unique=True
    )

    creada_por = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="invitaciones_creadas"
    )

    usada_por = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invitaciones_utilizadas"
    )

    expira_en = models.DateTimeField()

    usada_en = models.DateTimeField(
        null=True,
        blank=True
    )

    creada_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.correo} - {self.rol_destino}"

    class Meta:
        db_table = "accounts_invitation"
        verbose_name = "Invitación"
        verbose_name_plural = "Invitaciones"


class Consent(models.Model):

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    paciente = models.ForeignKey(
        Patient,
        on_delete=models.PROTECT,
        related_name="consentimientos"
    )

    aceptado_por = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="consentimientos_aceptados"
    )

    version_texto = models.CharField(max_length=50)

    aceptado_en = models.DateTimeField()

    retirado_en = models.DateTimeField(
        null=True,
        blank=True
    )

    def __str__(self):
        return f"Consentimiento de {self.paciente}"

    class Meta:
        db_table = "accounts_consent"
        verbose_name = "Consentimiento"
        verbose_name_plural = "Consentimientos"
