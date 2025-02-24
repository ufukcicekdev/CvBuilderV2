from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.BlogCategoryViewSet)
router.register(r'posts', views.BlogPostViewSet)
router.register(r'tags', views.BlogTagViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 