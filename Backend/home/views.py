from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from .mqtt_client import publish_message
from django.http import JsonResponse
import cv2
import numpy as np
from .models import Service, Personne
from .serializers import ServiceSerializer, PersonneSerializer
from pathlib import Path

CASCADE_PATH = (
    Path(__file__).resolve().parent.parent
    / "facerecognition"
    / "dataset"
    / "haarcascade_frontalface_default.xml"
)
FACE_CASCADE = cv2.CascadeClassifier(str(CASCADE_PATH))

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
        face_image = request.FILES.get("image")

        if not face_image:
            return JsonResponse(
                {"error": "No image uploaded"},
                status=400
            )
        image_bytes = face_image.read()
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        face_image.seek(0)

        if img is None:
            return JsonResponse(
                {"error": "Invalid image file"},
                status=400
            )

        if FACE_CASCADE.empty():
            return JsonResponse(
                {"error": "Face detector is not available"},
                status=500
            )

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = FACE_CASCADE.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=1,
            minSize=(80, 80)
        )

        if len(faces) == 0:
            return JsonResponse(
                {"error": "No face detected"},
                status=400
            )

        x, y, w, h = faces[0]
        face_region = gray[y:y + h, x:x + w]
        normalized_face = cv2.resize(face_region, (32, 32), interpolation=cv2.INTER_AREA)
        embedding = (normalized_face.astype(np.float32) / 255.0).flatten().tolist()
        payload = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        payload['face_embedding'] = embedding
        serializer = PersonneSerializer(data=payload, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PersonneCheckFaceView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    # POST /api/personnes/check-face/
    def post(self, request):
        face_image = request.FILES.get("image")

        if not face_image:
            return JsonResponse(
                {"error": "No image uploaded"},
                status=400
            )

        image_bytes = face_image.read()
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            return JsonResponse(
                {"error": "Invalid image file"},
                status=400
            )

        if FACE_CASCADE.empty():
            return JsonResponse(
                {"error": "Face detector is not available"},
                status=500
            )

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = FACE_CASCADE.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=1,
            minSize=(80, 80)
        )

        if len(faces) == 0:
            return JsonResponse(
                {"error": "No face detected"},
                status=400
            )

        x, y, w, h = faces[0]
        face_region = gray[y:y + h, x:x + w]
        normalized_face = cv2.resize(face_region, (32, 32), interpolation=cv2.INTER_AREA)
        embedding = (normalized_face.astype(np.float32) / 255.0).flatten().tolist()

        persone = Personne.objects.filter(statut='autorise').order_by('-created_at')
        for p in persone:
            if p.face_embedding and len(p.face_embedding) == len(embedding):
                dist = np.linalg.norm(np.array(p.face_embedding) - np.array(embedding))
                if dist < 0.6:  # Threshold for face match (tune as needed)
                    serializer = PersonneSerializer(p, context={'request': request})
                    return Response({
                        "message": "Face recognized",
                        "personne": serializer.data
                    })
        return Response(
            {"message": "Face not recognized"},
            status=404
        )

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