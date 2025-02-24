from django.db import models
from django.conf import settings
from users.models import User
from django.contrib.auth import get_user_model

User = get_user_model()

class CV(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Taslak'),
        ('completed', 'Tamamlandı'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    current_step = models.IntegerField(default=0)
    
    # Form verileri için JSON alanları
    personal_info = models.JSONField(default=dict)
    education = models.JSONField(default=list)
    experience = models.JSONField(default=list)
    skills = models.JSONField(default=list)
    languages = models.JSONField(default=list)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'CV'
        verbose_name_plural = 'CVs'

    def __str__(self):
        return f"{self.user.email}'s CV - {self.title}"

class CVTranslation(models.Model):
    cv = models.ForeignKey(CV, on_delete=models.CASCADE, related_name='translations')
    language = models.ForeignKey('profiles.Language', on_delete=models.CASCADE)
    content = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True) 