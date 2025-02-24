from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/cvs/', include('cvs.urls')),
    path('api/auth/', include('users.urls')),
    # ... diğer URL'ler ...
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 