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
from rest_framework.parsers import MultiPartParser, FormParser
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_profile_picture(request):
    if 'picture' not in request.FILES:
        return Response({
            'error': 'No picture provided'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = request.user
    user.profile_picture = request.FILES['picture']
    user.save()
    
    return Response({
        'message': 'Profile picture uploaded successfully',
        'picture_url': user.profile_picture.url
    })

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