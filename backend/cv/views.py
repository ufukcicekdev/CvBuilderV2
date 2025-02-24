from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .models import CV
from .serializers import CVSerializer

class CVViewSet(viewsets.ModelViewSet):
    queryset = CV.objects.all()
    serializer_class = CVSerializer

    def get_queryset(self):
        return CV.objects.prefetch_related('certificates').all()

    @action(detail=True, methods=['POST'], url_path='upload-video')
    def upload_video(self, request, pk=None):
        try:
            cv = self.get_object()
            
            if 'video' in request.FILES:
                # Eski videoyu sil
                if cv.video:
                    cv.video.delete()
                
                cv.video = request.FILES['video']
            
            cv.video_description = request.data.get('video_description', '')
            cv.save()
            
            return Response({'status': 'success'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            ) 