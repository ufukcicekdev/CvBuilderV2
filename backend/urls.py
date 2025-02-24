from django.urls import path, include

urlpatterns = [
    # ... diğer URL'ler ...
    path('api/', include('cvs.urls')),
] 