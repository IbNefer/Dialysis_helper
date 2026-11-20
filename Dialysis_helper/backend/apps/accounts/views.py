from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import Role
from .serializers import RoleSerializer, UserMeSerializer


class RoleListView(generics.ListAPIView):

    serializer_class = RoleSerializer

    def get_queryset(self):
        return Role.objects.filter(
            activo=True
        ).order_by("nombre")


class MeView(generics.RetrieveUpdateAPIView):

    serializer_class = UserMeSerializer
    permission_classes = [IsAuthenticated]

    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        return self.request.user

class LogoutView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"error": "El Refresh Token es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {"mensaje": "Sesión cerrada correctamente."},
                status=status.HTTP_205_RESET_CONTENT
            )

        except TokenError:
            return Response(
                {"error": "El Refresh Token no es válido o ya fue utilizado."},
                status=status.HTTP_400_BAD_REQUEST
            )