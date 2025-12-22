from django.db import models
# from godapp_main.notificator.models 
# Create your models here.

class TodoItem(models.Model):
    title = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    until = models.DateTimeField(null=True, blank=True)

    notificators = models.ManyToManyField("notificator.NotificationChannel", blank=True)
    def __str__(self):
        return self.title