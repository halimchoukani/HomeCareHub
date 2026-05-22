from django.urls import path
from .views import DeviceControlView, ServiceView, UserView

urlpatterns = [
    path('services/',                  ServiceView.as_view()),
    path('users/',                    UserView.as_view()),
    path('device/control/', DeviceControlView.as_view()),
]