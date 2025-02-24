from django.db import models

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
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    current_step = models.IntegerField(default=0)
    
    # Personal Info
    personal_info = models.JSONField(default=dict, blank=True)
    
    # Experience
    experience = models.JSONField(default=list, blank=True)
    
    # Education
    education = models.JSONField(default=list, blank=True)
    
    # Skills
    skills = models.JSONField(default=list, blank=True)
    
    # Languages
    languages = models.JSONField(default=list, blank=True)
    
    # Video
    video = models.FileField(upload_to='cv_videos/', blank=True, null=True)
    video_description = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at'] 