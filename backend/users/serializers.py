from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, PasswordResetToken
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'password', 'password2', 'first_name', 'last_name', 
                 'user_type', 'social_id', 'social_provider', 'profile_picture')
        extra_kwargs = {
            'email': {'required': True},
            'user_type': {'required': True},
            'password': {'write_only': True},
            'password2': {'write_only': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['user_type'] = user.user_type
        return token 

class UserProfileSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'profile_picture', 'profile_picture_url', 
                 'phone', 'birth_date', 'profession', 'company_name', 'company_website', 
                 'company_position', 'company_size', 'user_type')
        read_only_fields = ('email', 'profile_picture_url')
        extra_kwargs = {
            'profile_picture': {'write_only': True}
        }

    def get_profile_picture_url(self, obj):
        if obj.profile_picture:
            return obj.profile_picture.url
        return None 

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            User.objects.get(email=value)
        except User.DoesNotExist:
            # Güvenlik nedeniyle kullanıcı bulunamasa bile hata döndürmüyoruz
            pass
        return value

class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    password = serializers.CharField(min_length=8, write_only=True)
    password_confirm = serializers.CharField(min_length=8, write_only=True)

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Şifreler eşleşmiyor."})
        
        try:
            token_obj = PasswordResetToken.objects.get(token=data['token'])
            if not token_obj.is_valid():
                raise serializers.ValidationError({"token": "Geçersiz veya süresi dolmuş token."})
            self.token_obj = token_obj
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError({"token": "Geçersiz token."})
        
        return data
    
    def save(self):
        user = self.token_obj.user
        user.set_password(self.validated_data['password'])
        user.save()
        
        # Token'ı kullanılmış olarak işaretle
        self.token_obj.is_used = True
        self.token_obj.save()
        
        return user 