from django.db import models

class Service(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    image = models.ImageField(upload_to='services/', blank=True, null=True)
    phone = models.CharField(max_length=20, default='')

    def __str__(self):
        return self.name

class Personne(models.Model):
    STATUT_CHOICES = [
        ('autorise', 'Autorisé'),
        ('bloque', 'Bloqué'),
    ]
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=100, blank=True, default='')
    phone = models.CharField(max_length=20)
    image = models.ImageField(upload_to='personnes/')
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='autorise')
    face_embedding = models.JSONField(blank=True, null=True, default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name