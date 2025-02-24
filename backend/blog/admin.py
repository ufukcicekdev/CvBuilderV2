from django.contrib import admin
from .models import BlogCategory, BlogPost, BlogPostTranslation, BlogTag, BlogComment

@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}

class BlogPostTranslationInline(admin.StackedInline):
    model = BlogPostTranslation
    extra = 1

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('get_title', 'category', 'author', 'published', 'created_at')
    list_filter = ('published', 'category', 'created_at')
    search_fields = ('translations__title', 'author__email')
    inlines = [BlogPostTranslationInline]
    
    def get_title(self, obj):
        return str(obj)
    get_title.short_description = 'Title'

@admin.register(BlogTag)
class BlogTagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}

@admin.register(BlogComment)
class BlogCommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'created_at', 'active')
    list_filter = ('active', 'created_at')
    search_fields = ('user__email', 'content') 