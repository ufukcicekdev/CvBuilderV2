from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from blog.models import BlogCategory, BlogPost, BlogPostTranslation, BlogTag
from faker import Faker
import random

User = get_user_model()
fake = Faker()

class Command(BaseCommand):
    help = 'Creates sample blog data'

    def handle(self, *args, **kwargs):
        # Create categories
        categories = []
        category_names = ['Kariyer Tavsiyeleri', 'CV Yazım İpuçları', 'İş Görüşmesi', 'Kişisel Gelişim']
        
        for name in category_names:
            category = BlogCategory.objects.create(name=name)
            categories.append(category)
            self.stdout.write(f'Created category: {category.name}')

        # Create tags
        tags = []
        tag_names = ['Kariyer', 'CV', 'Mülakat', 'İş Arama', 'Linkedin', 'Networking', 'Soft Skills']
        
        for name in tag_names:
            tag = BlogTag.objects.create(name=name)
            tags.append(tag)
            self.stdout.write(f'Created tag: {tag.name}')

        # Get or create a sample user
        user, created = User.objects.get_or_create(
            email='admin@example.com',
            defaults={
                'username': 'admin',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            user.set_password('admin123')
            user.save()

        # Create blog posts with translations
        languages = ['tr', 'en', 'es', 'zh', 'ar', 'hi']
        
        for _ in range(10):
            post = BlogPost.objects.create(
                category=random.choice(categories),
                author=user,
                published=True,
                view_count=random.randint(0, 1000)
            )
            post.tags.set(random.sample(tags, random.randint(1, 3)))

            for lang in languages:
                BlogPostTranslation.objects.create(
                    post=post,
                    language=lang,
                    title=fake.sentence(),
                    summary=fake.paragraph(),
                    content='\n\n'.join(fake.paragraphs(nb=5)),
                    meta_title=fake.sentence(),
                    meta_description=fake.paragraph()
                )
            
            self.stdout.write(f'Created blog post with translations: {post}')

        self.stdout.write(self.style.SUCCESS('Successfully created sample blog data')) 