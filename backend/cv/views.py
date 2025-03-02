from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .models import CV
from .serializers import CVSerializer
from django.shortcuts import render
from django.template.loader import render_to_string
from django.http import HttpResponse
import json

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

    @action(detail=True, methods=['post'])
    def generate_web(self, request, pk=None):
        cv = self.get_object()
        template_id = request.data.get('template_id')
        
        if not template_id:
            return Response(
                {'error': 'Template ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # CV verilerini JSON olarak hazırla
            cv_data = self.get_serializer(cv).data
            
            # Template'i render et
            template_name = f'cv/templates/{template_id}.html'
            html_content = render_to_string(template_name, {'cv': cv_data})
            
            # HTML dosyasını kaydet
            file_name = f'cv_{cv.id}_{template_id}.html'
            file_path = f'media/cv_templates/{file_name}'
            
            with open(file_path, 'w') as f:
                f.write(html_content)
            
            # URL'i döndür
            web_url = f'/media/cv_templates/{file_name}'
            return Response({'web_url': web_url})
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 