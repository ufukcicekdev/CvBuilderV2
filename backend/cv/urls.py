from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CVViewSet, cv_view
from django.views.generic import TemplateView

router = DefaultRouter()
router.register(r'cvs', CVViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    # CV görüntüleme URL'i
    path('cv/<int:cv_id>/<str:translation_key>/<str:language>/', cv_view, name='cv_view'),
] 