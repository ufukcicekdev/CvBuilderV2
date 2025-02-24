from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import CV
from .serializers import CVSerializer
from rest_framework.authentication import TokenAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication

class CVListCreateView(generics.ListCreateAPIView):
    serializer_class = CVSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CV.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CVDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CVSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        print("User:", self.request.user)  # Debug için
        print("Auth:", self.request.auth)  # Debug için
        return CV.objects.filter(user=self.request.user)

class CVViewSet(viewsets.ModelViewSet):
    serializer_class = CVSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CV.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        data = {
            'title': request.data.get('title', 'Untitled CV'),
            'status': 'draft',
            'current_step': 0,
        }
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=True, methods=['patch'])
    def update_step(self, request, pk=None):
        cv = self.get_object()
        step = request.data.get('current_step')
        
        if step is not None:
            cv.current_step = step
            cv.save()
            serializer = self.get_serializer(cv)
            return Response(serializer.data)
        
        return Response(
            {'error': 'current_step is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def generate_pdf(self, request, pk=None):
        cv = self.get_object()
        # PDF oluşturma mantığı
        return Response({'status': 'PDF generated'})

    @action(detail=True, methods=['post'])
    def upload_certificate(self, request, pk=None):
        try:
            cv = self.get_object()
            file = request.FILES.get('file')
            
            if not file:
                return Response(
                    {'error': 'No file provided'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Dosyayı kaydet ve URL'ini döndür
            file_url = save_certificate_file(file)  
            return Response({'file_url': file_url})
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 