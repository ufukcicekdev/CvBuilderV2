from rest_framework import serializers
from .models import BlogCategory, BlogPost, BlogPostTranslation, BlogTag, BlogComment

class BlogCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCategory
        fields = ['id', 'name', 'slug']

class BlogPostTranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPostTranslation
        fields = ['language', 'title', 'slug', 'summary', 'content', 
                 'meta_title', 'meta_description', 'meta_keywords']

class BlogPostListSerializer(serializers.ModelSerializer):
    category = BlogCategorySerializer()
    current_translation = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogPost
        fields = ['id', 'category', 'author', 'created_at', 
                 'featured_image', 'current_translation']

    def get_current_translation(self, obj):
        language = self.context.get('language', 'tr')
        translation = obj.translations.filter(language=language).first()
        if translation:
            return BlogPostTranslationSerializer(translation).data
        return None

class BlogPostDetailSerializer(BlogPostListSerializer):
    translations = BlogPostTranslationSerializer(many=True)
    
    class Meta(BlogPostListSerializer.Meta):
        fields = BlogPostListSerializer.Meta.fields + ['translations', 'view_count']

class BlogTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogTag
        fields = ['id', 'name', 'slug']

class BlogCommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    replies = serializers.SerializerMethodField()

    class Meta:
        model = BlogComment
        fields = ['id', 'user', 'content', 'created_at', 'replies']

    def get_replies(self, obj):
        if obj.replies.exists():
            return BlogCommentSerializer(obj.replies.filter(active=True), many=True).data
        return [] 