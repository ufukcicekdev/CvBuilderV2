from rest_framework import viewsets, status, generics
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer, CustomTokenObtainPairSerializer, UserProfileSerializer
import logging
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .authentication import TokenAuthentication

logger = logging.getLogger(__name__)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            auth = TokenAuthentication()
            result = auth.authenticate_credentials(
                request.data.get('email'),
                request.data.get('password')
            )
            
            if 'error' in result:
                return Response({'error': result['error']}, status=result['status'])
            
            return Response({
                'user': serializer.data,
                'tokens': {
                    'access': result['access'],
                    'refresh': result['refresh']
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserSerializer

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({
                'error': 'Please provide both email and password'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        auth = TokenAuthentication()
        result = auth.authenticate_credentials(email, password)
        
        if 'error' in result:
            return Response({'error': result['error']}, status=result['status'])
        
        return Response(result)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user 

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def get_user_profile(request):
    if request.method == 'GET':
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    elif request.method == 'PATCH':
        try:
            user = request.user
            data = request.data.copy()
            
            # Profil resmi yükleme işlemi artık ayrı bir endpoint'te
            if 'profile_picture' in request.FILES:
                return Response(
                    {'error': 'Profile picture upload should be done via /api/users/upload-profile-picture/ endpoint'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Content-Type'a göre işlem yap
            content_type = request.content_type if hasattr(request, 'content_type') else ''
            
            logger.info(f"Profile update request with Content-Type: {content_type}")
            logger.info(f"Request data: {data}")
            
            # Diğer alanları güncelle
            serializer = UserProfileSerializer(user, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            
            logger.error(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Profile update error: {str(e)}")
            logger.error(f"Error type: {e.__class__.__name__}")
            return Response({
                'error': f'Failed to update profile: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_profile_picture(request):
    if 'profile_picture' not in request.FILES:
        return Response({
            'error': 'No picture provided'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = request.user
        logger.info(f"Uploading profile picture for user: {user.email}")
        
        # Eski resmi sil
        if user.profile_picture:
            logger.info(f"Deleting old profile picture: {user.profile_picture.name}")
            try:
                user.profile_picture.delete(save=False)
                logger.info("Old profile picture deleted successfully")
            except Exception as e:
                logger.error(f"Error deleting old profile picture: {str(e)}")
        
        # Yeni resmi kaydet
        file = request.FILES['profile_picture']
        logger.info(f"New file details - Name: {file.name}, Size: {file.size}, Content Type: {file.content_type}")
        
        # Dosya tipi kontrolü
        if not file.content_type.startswith('image/'):
            return Response({
                'error': 'Invalid file type. Only images are allowed.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Dosya boyutu kontrolü (5MB)
        if file.size > 5 * 1024 * 1024:
            return Response({
                'error': 'File size too large. Maximum size is 5MB.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Dosyayı kaydet
            user.profile_picture = file
            user.save()
            
            # Dosya yükleme sonrası bilgileri logla
            logger.info(f"Profile picture saved successfully. URL: {user.profile_picture.url}")
            logger.info(f"File path in storage: {user.profile_picture.name}")
        except Exception as e:
            logger.error(f"Error saving profile picture: {str(e)}")
            logger.error(f"Error type: {e.__class__.__name__}")
            raise
        
        return Response({
            'message': 'Profile picture uploaded successfully',
            'profile_picture_url': user.profile_picture.url
        })
    except Exception as e:
        logger.error(f"Profile picture upload error: {str(e)}")
        logger.error(f"Error details: {e.__class__.__name__}")
        return Response({
            'error': f'Failed to upload profile picture: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TokenRefreshView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'error': 'Refresh token is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        auth = TokenAuthentication()
        result = auth.refresh_token(refresh_token)
        
        if 'error' in result:
            return Response({'error': result['error']}, status=result['status'])
        
        return Response(result)

class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'error': 'Refresh token is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        auth = TokenAuthentication()
        result = auth.blacklist_token(refresh_token)
        
        return Response(
            {'message': result.get('message', 'Logged out')}, 
            status=result.get('status', status.HTTP_200_OK)
        ) 