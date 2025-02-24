from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import CV
from .serializers import CVSerializer
from rest_framework.authentication import TokenAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.viewsets import ModelViewSet
from django.template.loader import render_to_string
from weasyprint import HTML
from django.http import HttpResponse
import tempfile
import os
import pdfkit
from django.conf import settings
from django.template import TemplateDoesNotExist

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
    queryset = CV.objects.all()
    serializer_class = CVSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CV.objects.prefetch_related('certificates').filter(user=self.request.user)

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

    @action(detail=True, methods=['post'], url_path='generate-web')
    def generate_web(self, request, pk=None):
        try:
            cv = self.get_object()
            template_id = request.data.get('template_id')
            
            # Template path'i düzelt
            template_path = f'web/{template_id}.html'  # templates/ prefix'ini kaldırdık
            
            # Context hazırla
            context = {
                'personal_info': cv.personal_info,
                'experience': cv.experience,
                'education': cv.education,
                'skills': cv.skills,
                'languages': cv.languages,
                'certificates': cv.certificates.all(),
                'video_url': cv.video.url if cv.video else None,
                'video_description': cv.video_description
            }
            
            try:
                # HTML oluştur
                html_content = render_to_string(template_path, context)
            except TemplateDoesNotExist:
                return Response(
                    {'error': f'Template not found: {template_path}'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # HTML dosyasını kaydet
            filename = f'cv_{cv.id}_{template_id}.html'
            filepath = os.path.join(settings.MEDIA_ROOT, 'cv_web', filename)
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            
            with open(filepath, 'w') as f:
                f.write(html_content)
            
            web_url = f'{settings.MEDIA_URL}cv_web/{filename}'
            
            return Response({'web_url': web_url})
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'], url_path='generate-pdf')
    def generate_pdf(self, request, pk=None):
        try:
            cv = self.get_object()
            template_id = request.data.get('template_id')
            
            # Template seç
            template_path = f'templates/pdf/{template_id}.html'
            
            # Context hazırla
            context = {
                'personal_info': cv.personal_info,
                'experience': cv.experience,
                'education': cv.education,
                'skills': cv.skills,
                'languages': cv.languages,
                'certificates': cv.certificates.all()
            }
            
            # HTML oluştur
            html_content = render_to_string(template_path, context)
            
            # PDF oluştur
            options = {
                'page-size': 'A4',
                'margin-top': '0.75in',
                'margin-right': '0.75in',
                'margin-bottom': '0.75in',
                'margin-left': '0.75in',
                'encoding': "UTF-8",
            }
            
            # PDF'i kaydet
            filename = f'cv_{cv.id}_{template_id}.pdf'
            filepath = os.path.join(settings.MEDIA_ROOT, 'cv_pdf', filename)
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            
            pdfkit.from_string(html_content, filepath, options=options)
            
            pdf_url = f'{settings.MEDIA_URL}cv_pdf/{filename}'
            
            return Response({'pdf_url': pdf_url})
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

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
            
            # Tüm CV verilerini serialize edip dön
            serializer = self.get_serializer(cv)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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
            
            # Tüm CV verilerini serialize edip dön
            serializer = self.get_serializer(cv)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

@api_view(['GET'])
def debug_auth(request):
    return Response({
        'user': str(request.user),
        'auth': str(request.auth),
        'headers': dict(request.headers)
    }, status=status.HTTP_200_OK) 