
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),

    # Aplicación principal
    path("api/", include("apps.core.urls")),

    # Módulo 1: Acceso y perfiles
    path("api/accounts/", include("apps.accounts.urls")),

    # Documentación de la API
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
]
