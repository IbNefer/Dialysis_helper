import pytest
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_health_responde_ok_sin_sesion():
    respuesta = APIClient().get("/api/health/")
    assert respuesta.status_code == 200
    assert respuesta.json() == {"status": "ok"}


@pytest.mark.django_db
def test_schema_openapi_disponible():
    respuesta = APIClient().get("/api/schema/")
    assert respuesta.status_code == 200
