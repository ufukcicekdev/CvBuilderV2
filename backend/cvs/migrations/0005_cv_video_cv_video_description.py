# Generated by Django 5.1.6 on 2025-02-24 21:18

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("cvs", "0004_certificate"),
    ]

    operations = [
        migrations.AddField(
            model_name="cv",
            name="video",
            field=models.FileField(
                blank=True,
                help_text="Video dosyası yükleyebilirsiniz",
                null=True,
                upload_to="cv_videos/",
            ),
        ),
        migrations.AddField(
            model_name="cv",
            name="video_description",
            field=models.TextField(blank=True, null=True),
        ),
    ]
