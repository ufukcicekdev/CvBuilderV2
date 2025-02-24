from django.urls import path
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'cvs', views.CVViewSet, basename='cv')

urlpatterns = router.urls

urlpatterns = [
    path('', views.CVListCreateView.as_view(), name='cv-list-create'),
    path('<int:pk>/', views.CVDetailView.as_view(), name='cv-detail'),
    path('<int:pk>/update_step/', views.CVViewSet.as_view({'patch': 'update_step'}), name='cv-update-step'),
    path('<int:pk>/upload_certificate/', views.CVViewSet.as_view({'post': 'upload_certificate'}), name='cv-upload-certificate'),
    # ... diğer URL'ler
] 