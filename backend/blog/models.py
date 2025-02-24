from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify
from users.models import User
from django.conf import settings

class BlogCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Blog Category')
        verbose_name_plural = _('Blog Categories')

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class BlogPost(models.Model):
    category = models.ForeignKey(BlogCategory, on_delete=models.CASCADE, related_name='posts')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_posts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published = models.BooleanField(default=False)
    featured_image = models.ImageField(upload_to='blog/images/', null=True, blank=True)
    view_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        # İlk çevirinin başlığını döndür
        translation = self.translations.filter(language=settings.LANGUAGE_CODE).first()
        if translation:
            return translation.title
        return f"Blog Post {self.id}"

class BlogPostTranslation(models.Model):
    LANGUAGE_CHOICES = [
        ('tr', 'Türkçe'),
        ('en', 'English'),
        ('es', 'Español'),
        ('zh', '中文'),
        ('ar', 'العربية'),
        ('hi', 'हिन्दी'),
    ]

    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='translations')
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES)
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    summary = models.TextField(max_length=500)
    content = models.TextField()
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.TextField(max_length=500, blank=True)
    meta_keywords = models.CharField(max_length=200, blank=True)

    class Meta:
        unique_together = ['post', 'language']
        verbose_name = _('Blog Post Translation')
        verbose_name_plural = _('Blog Post Translations')

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.language})"

class BlogTag(models.Model):
    name = models.CharField(max_length=50)
    slug = models.SlugField(unique=True, blank=True)
    posts = models.ManyToManyField(BlogPost, related_name='tags')

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class BlogComment(models.Model):
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Comment by {self.user.username} on {self.post}' 