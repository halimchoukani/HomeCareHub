from django.contrib.auth.models import User
from rest_framework import serializers


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password']

    def create(self, validated_data):
        email = validated_data['email']

        user = User.objects.create_user(
            username=email,  # auto use email
            email=email,
            role='user',  # default role
            password=validated_data['password']
        )

        return user