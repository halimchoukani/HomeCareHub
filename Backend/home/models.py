from django.db import models

class Service(models.Model):
    name         = models.CharField(max_length=100)
    description = models.TextField()
    image       = models.ImageField(upload_to='services/')
    phone   = models.CharField(max_length=20, default='')

    def __str__(self):
        return self.nom

class User(models.Model):
    name         = models.CharField(max_length=100)
    role        = models.CharField(max_length=100)
    phone   = models.CharField(max_length=20)
    image       = models.ImageField(upload_to='users/')

    def __str__(self):
        return self.name