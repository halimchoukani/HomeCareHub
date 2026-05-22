from rest_framework import serializers
from .models import Service, User

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Service
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = '__all__'