from django.urls import path
from .views import (
    DeviceControlView, 
    ServiceView, 
    PersonneView, 
    PersonneAjouterView, 
    PersonneSupprimerView,PersonneCheckFaceView
)

urlpatterns = [
    path('services/', ServiceView.as_view()),
    path('personnes/', PersonneView.as_view()),
    path('personnes/<int:pk>/', PersonneView.as_view()),
    path('personnes/ajouter/', PersonneAjouterView.as_view()),
    path('personnes/check-face/', PersonneCheckFaceView.as_view()),
    path('personnes/<int:pk>/supprimer/', PersonneSupprimerView.as_view()),
    path('device/control/', DeviceControlView.as_view()),
]