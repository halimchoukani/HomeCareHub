from django.urls import path
from .views import TestFaceRecognitionAPIView

urlpatterns = [
    path('', TestFaceRecognitionAPIView.as_view(), name='test-face-recognition'),
]