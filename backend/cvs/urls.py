from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'cvs', views.CVViewSet, basename='cv')

urlpatterns = router.urls 