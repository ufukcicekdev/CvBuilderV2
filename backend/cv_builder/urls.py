from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users.views import UserViewSet, CustomTokenObtainPairView, CustomTokenRefreshView
from profiles.views import ProfileViewSet, SkillViewSet, LanguageViewSet
from cvs.views import CVViewSet
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'skills', SkillViewSet)
router.register(r'languages', LanguageViewSet)
router.register(r'cvs', CVViewSet, basename='cv')

urlpatterns = [
    path('admin/', admin.site.urls),    
    path('api/', include(router.urls)),
    path('cvs/', include('cvs.urls')),
    path('api/users/', include('users.urls')),
    path('api/auth/', include('social_auth.urls')),
    path('', include('social_django.urls', namespace='social')),
    path('api/blog/', include('blog.urls')),
    path('api/contact/', include('contact.urls')),
    path('api/users/token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 