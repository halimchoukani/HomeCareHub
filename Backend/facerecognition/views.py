from pathlib import Path

from rest_framework.parsers import MultiPartParser, FormParser
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework import status
import cv2
import numpy as np


CASCADE_PATH = (
    Path(__file__).resolve().parent / "dataset" / "haarcascade_frontalface_default.xml"
)
FACE_CASCADE = cv2.CascadeClassifier(str(CASCADE_PATH))

class TestFaceRecognitionAPIView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        return JsonResponse({
            'message': 'Face recognition API working',
            'user': {
                'id': request.user.id,
                'email': request.user.email,
            }
        })

    def post(self, request):
        face_image = request.FILES.get("face_image")

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

        return JsonResponse({
            "message": "Face detected",
            "embedding": embedding,
            "dimension": len(embedding)
        }, status=200)
