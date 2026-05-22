from rest_framework import serializers
from django.utils import timezone
from .models import Service, Personne

class ServiceSerializer(serializers.ModelSerializer):
    nom = serializers.CharField(source='name', required=False)
    telephone = serializers.CharField(source='phone', required=False)

    class Meta:
        model = Service
        fields = ['id', 'name', 'nom', 'description', 'image', 'phone', 'telephone','face_embedding']

class PersonneSerializer(serializers.ModelSerializer):
    heure = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()

    class Meta:
        model = Personne
        fields = [
            'id', 'name', 'role', 'phone', 'image', 'statut', 'heure', 'date', 'created_at', 'face_embedding'
        ]

    def to_internal_value(self, data):
        # Preserve uploaded files while still allowing key remapping.
        data_dict = data.copy() if hasattr(data, 'copy') else dict(data)
        
        # 1. Translate 'nom' or 'name'
        if 'nom' in data_dict and 'name' not in data_dict:
            data_dict['name'] = data_dict['nom']
            
        # 2. Translate 'telephone' or 'phone'
        if 'telephone' in data_dict and 'phone' not in data_dict:
            data_dict['phone'] = data_dict['telephone']
            
        # 3. Translate 'photo' or 'image'
        if 'photo' in data_dict and 'image' not in data_dict:
            data_dict['image'] = data_dict['photo']
            
        # Call original validation with translated keys
        return super().to_internal_value(data_dict)

    def to_representation(self, instance):
        # Perform standard serialization
        rep = super().to_representation(instance)
        
        # Re-inject translated French fields in output JSON for frontend compatibility
        rep['nom'] = instance.name
        rep['telephone'] = instance.phone
        rep['photo'] = rep['image'] if rep['image'] else None
        
        return rep

    def get_heure(self, obj):
        local_time = timezone.localtime(obj.created_at)
        return local_time.strftime("%H:%M")

    def get_date(self, obj):
        local_time = timezone.localtime(obj.created_at)
        today = timezone.localdate()
        if local_time.date() == today:
            return "Aujourd'hui"
        elif local_time.date() == today - timezone.timedelta(days=1):
            return "Hier"
        return local_time.strftime("%d/%m/%Y")