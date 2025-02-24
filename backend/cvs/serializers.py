from rest_framework import serializers
from .models import CV, CVTranslation
from profiles.serializers import LanguageSerializer

class CVTranslationSerializer(serializers.ModelSerializer):
    language = LanguageSerializer(read_only=True)
    
    class Meta:
        model = CVTranslation
        fields = ('id', 'language', 'content', 'created_at', 'updated_at')

class CVSerializer(serializers.ModelSerializer):
    translations = CVTranslationSerializer(many=True, read_only=True)
    personal_info = serializers.JSONField(required=False)
    education = serializers.JSONField(required=False, default=list)
    experience = serializers.JSONField(required=False, default=list)
    skills = serializers.JSONField(required=False, default=list)
    languages = serializers.JSONField(required=False, default=list)
    
    class Meta:
        model = CV
        fields = [
            'id', 'title', 'status', 'current_step',
            'user', 'personal_info', 'experience',
            'education', 'skills', 'languages',
            'created_at', 'updated_at', 'translations'
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