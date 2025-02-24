from django.urls import path
from . import views

urlpatterns = [
    path('', views.CVListCreateView.as_view(), name='cv-list-create'),
    path('<int:pk>/', views.CVDetailView.as_view(), name='cv-detail'),
    path('<int:pk>/update_step/', views.CVViewSet.as_view({'patch': 'update_step'}), name='cv-update-step'),
    path('<int:pk>/upload_certificate/', views.CVViewSet.as_view({'post': 'upload_certificate'}), name='cv-upload-certificate'),
    # ... diğer URL'ler
] 