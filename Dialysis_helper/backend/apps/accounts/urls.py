from django.urls import path

from rest_framework_simplejwt.views import TokenRefreshView

from .views import RoleListView, MeView
from .authentication import CustomTokenObtainPairView
from .views import RoleListView, MeView, LogoutView


urlpatterns = [
    # Roles
    path("roles/", RoleListView.as_view(), name="role-list"),

    # Perfil del usuario autenticado
    path("me/", MeView.as_view(), name="user-me"),

    # Autenticación JWT
    path(
        "token/",
        CustomTokenObtainPairView.as_view(),
        name="token-obtain-pair"
    ),

    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token-refresh"
    ),
    path(
        "logout/", 
        LogoutView.as_view(), 
        name="logout"
    ),
]