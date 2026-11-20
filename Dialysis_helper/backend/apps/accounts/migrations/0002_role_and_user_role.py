
import uuid

import django.db.models.deletion
from django.db import migrations, models


def migrate_user_roles(apps, schema_editor):
    Role = apps.get_model("accounts", "Role")
    User = apps.get_model("accounts", "User")

    database = schema_editor.connection.alias

    roles = [
        ("administrador", "Administrador"),
        ("doctor", "Doctor"),
        ("paciente", "Paciente"),
        ("cuidador", "Cuidador"),
    ]

    # Crear los cuatro roles iniciales.
    for codigo, nombre in roles:
        Role.objects.using(database).get_or_create(
            codigo=codigo,
            defaults={
                "nombre": nombre,
                "activo": True,
            }
        )

    # Trasladar el rol de texto de cada usuario
    # a la nueva relación con la tabla Role.
    for user in User.objects.using(database).all():

        try:
            role = Role.objects.using(database).get(
                codigo=user.rol
            )
        except Role.DoesNotExist:
            raise RuntimeError(
                f"No existe un rol registrado para el código: {user.rol}"
            )

        user.rol_nuevo_id = role.pk

        user.save(
            using=database,
            update_fields=["rol_nuevo"]
        )


def reverse_user_roles(apps, schema_editor):
    User = apps.get_model("accounts", "User")

    database = schema_editor.connection.alias

    for user in User.objects.using(database).all():

        user.rol = user.rol_nuevo.codigo

        user.save(
            using=database,
            update_fields=["rol"]
        )


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [

        # 1. Crear la tabla de roles.
        migrations.CreateModel(
            name="Role",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "codigo",
                    models.CharField(
                        max_length=30,
                        unique=True,
                    ),
                ),
                (
                    "nombre",
                    models.CharField(max_length=50),
                ),
                (
                    "descripcion",
                    models.TextField(
                        blank=True,
                        null=True,
                    ),
                ),
                (
                    "activo",
                    models.BooleanField(default=True),
                ),
            ],
            options={
                "verbose_name": "Rol",
                "verbose_name_plural": "Roles",
                "db_table": "accounts_role",
            },
        ),

        # 2. Agregar temporalmente la nueva relación.
        migrations.AddField(
            model_name="user",
            name="rol_nuevo",
            field=models.ForeignKey(
                to="accounts.role",
                on_delete=django.db.models.deletion.PROTECT,
                related_name="usuarios",
                null=True,
                blank=True,
            ),
        ),

        # 3. Crear los roles y transferir los valores existentes.
        migrations.RunPython(
            migrate_user_roles,
            reverse_user_roles,
        ),

        # 4. Eliminar el antiguo campo de texto.
        migrations.RemoveField(
            model_name="user",
            name="rol",
        ),

        # 5. Renombrar la relación temporal.
        migrations.RenameField(
            model_name="user",
            old_name="rol_nuevo",
            new_name="rol",
        ),

        # 6. Convertir la relación en obligatoria.
        migrations.AlterField(
            model_name="user",
            name="rol",
            field=models.ForeignKey(
                to="accounts.role",
                on_delete=django.db.models.deletion.PROTECT,
                related_name="usuarios",
                db_column="rol_id",
            ),
        ),
    ]
