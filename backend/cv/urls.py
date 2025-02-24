from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CVViewSet

router = DefaultRouter()
router.register(r'cvs', CVViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
] 