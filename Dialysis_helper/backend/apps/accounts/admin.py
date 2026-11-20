
from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField

from .models import User, Role, Doctor, Patient, PatientCaregiver, Invitation, Consent


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):

    list_display = (
        "codigo",
        "nombre",
        "activo",
    )

    list_filter = ("activo",)

    search_fields = (
        "codigo",
        "nombre",
    )


class UserCreationForm(forms.ModelForm):

    password1 = forms.CharField(
        label="Contraseña",
        widget=forms.PasswordInput
    )

    password2 = forms.CharField(
        label="Confirmar contraseña",
        widget=forms.PasswordInput
    )

    class Meta:
        model = User
        fields = (
            "correo",
            "nombre",
            "telefono",
            "rol",
            "activo",
            "is_staff",
        )

    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")

        if password1 and password2 and password1 != password2:
            raise forms.ValidationError(
                "Las contraseñas no coinciden"
            )

        return password2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])

        if commit:
            user.save()

        return user


class UserChangeForm(forms.ModelForm):

    password = ReadOnlyPasswordHashField(
        label="Contraseña",
        help_text=(
            "Las contraseñas no se pueden visualizar. "
            "Puedes establecer una nueva contraseña."
        )
    )

    class Meta:
        model = User
        fields = "__all__"


@admin.register(User)
class CustomUserAdmin(UserAdmin):

    form = UserChangeForm
    add_form = UserCreationForm

    ordering = ("correo",)

    list_display = (
        "correo",
        "nombre",
        "rol",
        "activo",
        "is_staff",
        "mfa_activo",
    )

    list_filter = (
        "rol",
        "activo",
        "is_staff",
        "mfa_activo",
    )

    search_fields = (
        "correo",
        "nombre",
        "telefono",
    )

    fieldsets = (
        ("Información personal", {
            "fields": (
                "correo",
                "password",
                "nombre",
                "telefono",
            )
        }),
        ("Permisos", {
            "fields": (
                "rol",
                "activo",
                "is_staff",
                "is_superuser",
                "groups",
                "user_permissions",
            )
        }),
        ("Seguridad", {
            "fields": (
                "mfa_activo",
                "last_login",
            )
        }),
    )

    add_fieldsets = (
        ("Crear usuario", {
            "classes": ("wide",),
            "fields": (
                "correo",
                "nombre",
                "telefono",
                "rol",
                "password1",
                "password2",
                "activo",
                "is_staff",
            ),
        }),
    )

    filter_horizontal = (
        "groups",
        "user_permissions",
    )


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):

    list_display = (
        "usuario",
        "especialidad",
        "centro",
    )

    search_fields = (
        "usuario__correo",
        "usuario__nombre",
        "especialidad",
        "centro",
    )

    autocomplete_fields = ("usuario",)

    list_select_related = ("usuario",)


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):

    list_display = (
        "usuario",
        "doctor",
        "fecha_nacimiento",
        "activo",
    )

    list_filter = ("activo",)

    search_fields = (
        "usuario__correo",
        "usuario__nombre",
        "doctor__usuario__correo",
    )

    autocomplete_fields = (
        "usuario",
        "doctor",
    )

    list_select_related = (
        "usuario",
        "doctor",
        "doctor__usuario",
    )
@admin.register(PatientCaregiver)
class PatientCaregiverAdmin(admin.ModelAdmin):
    list_display = (
        "paciente",
        "cuidador",
        "relacion",
        "activo",
        "fecha_inicio",
        "fecha_fin"
    )

    list_filter = ("activo", "relacion")
    search_fields = (
        "paciente__usuario__correo",
        "cuidador__correo"
    )


@admin.register(Invitation)
class InvitationAdmin(admin.ModelAdmin):
    list_display = (
        "correo",
        "rol_destino",
        "creada_por",
        "expira_en",
        "usada_en"
    )

    list_filter = ("rol_destino",)
    search_fields = ("correo", "creada_por__correo")


@admin.register(Consent)
class ConsentAdmin(admin.ModelAdmin):
    list_display = (
        "paciente",
        "aceptado_por",
        "version_texto",
        "aceptado_en",
        "retirado_en"
    )

    search_fields = (
        "paciente__usuario__correo",
        "aceptado_por__correo"
    )