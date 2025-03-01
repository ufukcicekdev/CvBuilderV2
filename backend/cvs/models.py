from django.db import models
from django.conf import settings
from users.models import User
from django.contrib.auth import get_user_model

User = get_user_model()

class Certificate(models.Model):
    cv = models.ForeignKey('CV', related_name='certificates', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    issuer = models.CharField(max_length=255)
    date = models.DateField()
    description = models.TextField(blank=True, null=True)
    url = models.URLField(max_length=500, blank=True, null=True)
    
    # Sertifika dosyası için alan
    document = models.FileField(
        upload_to='certificates/',
        blank=True, 
        null=True,
        help_text='PDF veya resim dosyası yükleyebilirsiniz'
    )
    
    # Dosya tipi için alan
    document_type = models.CharField(
        max_length=10,
        choices=[
            ('pdf', 'PDF'),
            ('image', 'Image'),
        ],
        blank=True,
        null=True
    )

    class Meta:
        ordering = ['-date']

    def save(self, *args, **kwargs):
        # Dosya yüklendiyse tipini belirle
        if self.document:
            file_name = self.document.name.lower()
            if file_name.endswith('.pdf'):
                self.document_type = 'pdf'
            elif any(file_name.endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.gif']):
                self.document_type = 'image'
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Dosyayı fiziksel olarak sil
        if self.document:
            self.document.delete()
        super().delete(*args, **kwargs)

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
    
    # Video alanları
    video = models.FileField(
        upload_to='cv_videos/',
        blank=True,
        null=True,
        help_text='Video dosyası yükleyebilirsiniz'
    )
    video_description = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'CV'
        verbose_name_plural = 'CVs'

    def __str__(self):
        return f"{self.user.email}'s CV - {self.title}"

    def delete(self, *args, **kwargs):
        # Video dosyasını fiziksel olarak sil
        if self.video:
            self.video.delete()
        super().delete(*args, **kwargs)

class CVTranslation(models.Model):
    LANGUAGE_CHOICES = [
        ('tr', 'Türkçe'),
        ('en', 'English'),
        ('es', 'Español'),
        ('zh', '中文'),
        ('ar', 'العربية'),
        ('hi', 'हिन्दी')
    ]

    cv = models.ForeignKey(CV, on_delete=models.CASCADE, related_name='translations')
    language_code = models.CharField(
        max_length=2,
        choices=LANGUAGE_CHOICES,
        default='en'
    )
    
    # Çevrilen içerikler - Her alan için varsayılan boş değerler
    personal_info = models.JSONField(default=dict)
    education = models.JSONField(default=list)
    experience = models.JSONField(default=list)
    skills = models.JSONField(default=list)
    languages = models.JSONField(default=list)
    certificates = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('cv', 'language_code')
        indexes = [
            models.Index(fields=['cv', 'language_code'])
        ]
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.cv.title} - {self.get_language_code_display()}"

    @property
    def content(self):
        """Tüm çevrilmiş içeriği tek bir dict olarak döndürür"""
        return {
            'personal_info': self.personal_info,
            'education': self.education,
            'experience': self.experience,
            'skills': self.skills,
            'languages': self.languages,
            'certificates': self.certificates,

        }

    def update_content(self, translated_content):
        """Çevrilmiş içeriği ilgili alanlara dağıtır"""
        self.personal_info = translated_content.get('personal_info', {})
        self.education = translated_content.get('education', [])
        self.experience = translated_content.get('experience', [])
        self.skills = translated_content.get('skills', [])
        self.languages = translated_content.get('languages', [])
        self.certificates = translated_content.get('certificates', [])
        self.save() 