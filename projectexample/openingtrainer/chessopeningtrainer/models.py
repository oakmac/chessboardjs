from django.db import models

class Opening(models.Model):
    eco = models.CharField(max_length=255, default='')
    name = models.CharField(max_length=255)
    pgn = models.TextField()

# Create your models here.
