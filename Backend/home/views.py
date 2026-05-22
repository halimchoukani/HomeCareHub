from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .mqtt_client import publish_message

from .models import Service
from .serializers import ServiceSerializer, UserSerializer


# USER VIEWS
class UserView(APIView):
    permission_classes = [IsAuthenticated]

    # GET /api/home/user/
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    # DELETE /api/home/user/
    def delete(self, request):
        user = request.user
        user.delete()

        return Response(
            {'message': 'User supprimé'},
            status=status.HTTP_204_NO_CONTENT
        )


# SERVICE VIEWS
class ServiceView(APIView):
    permission_classes = [IsAuthenticated]

    # GET /api/home/services/
    def get(self, request):
        services = Service.objects.all()

        serializer = ServiceSerializer(
            services,
            many=True,
            context={'request': request}
        )

        return Response(serializer.data)
    

class DeviceControlView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        device_id = request.data.get("device_id")
        state = request.data.get("state")

        topic = f"homecarehub/{device_id}"

        success = publish_message(
            topic,
            str(state).lower()
        )

        if not success:
            return Response(
                {"error": "MQTT publish failed"},
                status=500
            )

        return Response({
            "message": "Command sent",
            "topic": topic,
            "state": state
        })