from drf_spectacular.utils import extend_schema
from rest_framework import serializers
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthSerializer(serializers.Serializer):
    status = serializers.CharField()


class HealthView(APIView):
    """Comprueba que el backend esta arriba. No requiere sesion."""

    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(responses=HealthSerializer, tags=["sistema"])
    def get(self, request):
        return Response({"status": "ok"})
