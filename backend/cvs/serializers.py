from rest_framework import serializers
from .models import CV, CVTranslation, Certificate
from profiles.serializers import LanguageSerializer

class CVTranslationSerializer(serializers.ModelSerializer):
    language = LanguageSerializer(read_only=True)
    
    class Meta:
        model = CVTranslation
        fields = ('id', 'language', 'content', 'created_at', 'updated_at')

class CertificateSerializer(serializers.ModelSerializer):
    document_url = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = [
            'id', 
            'name', 
            'issuer', 
            'date', 
            'description', 
            'url',
            'document',
            'document_type',
            'document_url'
        ]

    def get_document_url(self, obj):
        if obj.document:
            return self.context['request'].build_absolute_uri(obj.document.url)
        return None

class CVSerializer(serializers.ModelSerializer):
    translations = CVTranslationSerializer(many=True, read_only=True)
    personal_info = serializers.JSONField(required=False)
    education = serializers.JSONField(required=False, default=list)
    experience = serializers.JSONField(required=False, default=list)
    skills = serializers.JSONField(required=False, default=list)
    languages = serializers.JSONField(required=False, default=list)
    certificates = CertificateSerializer(many=True, required=False)
    video_url = serializers.SerializerMethodField()
    
    class Meta:
        model = CV
        fields = [
            'id', 'title', 'status', 'current_step',
            'user', 'personal_info', 'experience',
            'education', 'skills', 'languages',
            'created_at', 'updated_at', 'translations',
            'certificates', 'video', 'video_description',
            'video_url'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

    def validate_personal_info(self, value):
        if value:
            required_fields = ['full_name', 'email', 'phone', 'address']
            missing_fields = [field for field in required_fields if not value.get(field)]
            if missing_fields:
                raise serializers.ValidationError(f"Missing required fields: {', '.join(missing_fields)}")
        return value

    def validate_current_step(self, value):
        if value < 0 or value > 6:  # 6 yerine len(steps) kullanılabilir
            raise serializers.ValidationError("Invalid step value")
        return value

    def create(self, validated_data):
        validated_data.setdefault('personal_info', {})
        validated_data.setdefault('education', [])
        validated_data.setdefault('experience', [])
        validated_data.setdefault('skills', [])
        validated_data.setdefault('languages', [])
        
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def get_video_url(self, obj):
        if obj.video:
            return self.context['request'].build_absolute_uri(obj.video.url)
        return None

    def update(self, instance, validated_data):
        certificates_data = validated_data.pop('certificates', [])
        
        # Mevcut sertifikaları sil
        if 'certificates' in self.initial_data:
            instance.certificates.all().delete()
            
            # Yeni sertifikaları ekle
            for cert_data in certificates_data:
                document = cert_data.pop('document', None)
                certificate = Certificate.objects.create(cv=instance, **cert_data)
                if document:
                    certificate.document = document
                    certificate.save()

        # Video işlemi
        if 'video' in validated_data:
            if instance.video:
                instance.video.delete()
            instance.video = validated_data.pop('video')
        
        if 'video_description' in validated_data:
            instance.video_description = validated_data.pop('video_description')

        return super().update(instance, validated_data) 