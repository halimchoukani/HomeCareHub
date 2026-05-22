from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from .mqtt_client import publish_message

from .models import Service, Personne
from .serializers import ServiceSerializer, PersonneSerializer


# SERVICE VIEWS
class ServiceView(APIView):
    permission_classes = [IsAuthenticated]

    # GET /api/services/
    def get(self, request):
        services = Service.objects.all()
        serializer = ServiceSerializer(
            services,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)


# PERSONNE LIST / DETAIL / UPDATE
class PersonneView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    # GET /api/personnes/
    def get(self, request):
        personnes = Personne.objects.all().order_by('-created_at')
        serializer = PersonneSerializer(
            personnes,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)

    # PUT/PATCH /api/personnes/<id>/ (e.g. to update status)
    def patch(self, request, pk):
        personne = get_object_or_404(Personne, pk=pk)
        serializer = PersonneSerializer(personne, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# PERSONNE ADD (supports MultiPart form-data for photo upload)
class PersonneAjouterView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    # POST /api/personnes/ajouter/
    def post(self, request):
        # We mapped 'nom' -> 'name', 'telephone' -> 'phone', 'photo' -> 'image' in the Serializer.
        # Django Rest Framework can deserialize 'nom', 'telephone', and 'photo' automatically
        # because of the 'source' argument in our PersonneSerializer fields!
        serializer = PersonneSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# PERSONNE DELETE
class PersonneSupprimerView(APIView):
    permission_classes = [IsAuthenticated]

    # DELETE /api/personnes/<id>/supprimer/
    def delete(self, request, pk):
        personne = get_object_or_404(Personne, pk=pk)
        personne.delete()
        return Response(
            {'message': 'Personne supprimée'},
            status=status.HTTP_204_NO_CONTENT
        )

    # Allow POST as well for safety
    def post(self, request, pk):
        personne = get_object_or_404(Personne, pk=pk)
        personne.delete()
        return Response(
            {'message': 'Personne supprimée'},
            status=status.HTTP_204_NO_CONTENT
        )


# DEVICE CONTROL (MQTT)
class DeviceControlView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        device_id = request.data.get("device_id", "door_1")
        state = request.data.get("state")  # "open" or "close" or true/false

        topic = f"homecarehub/{device_id}"

        # Standardise message payload
        payload = str(state).lower()
        success = publish_message(topic, payload)

        if not success:
            return Response(
                {"error": "MQTT publish failed"},
                status=500
            )

        return Response({
            "message": f"Door control command sent to {topic}",
            "topic": topic,
            "state": state
        })