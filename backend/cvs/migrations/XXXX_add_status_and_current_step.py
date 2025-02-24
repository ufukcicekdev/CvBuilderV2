from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('cvs', '0001_initial'),  # Önceki migration'ın adını buraya yazın
    ]

    operations = [
        migrations.AddField(
            model_name='cv',
            name='status',
            field=models.CharField(
                choices=[('draft', 'Taslak'), ('completed', 'Tamamlandı')],
                default='draft',
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='cv',
            name='current_step',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='cv',
            name='personal_info',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='cv',
            name='experience',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='cv',
            name='education',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='cv',
            name='skills',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='cv',
            name='languages',
            field=models.JSONField(blank=True, null=True),
        ),
    ] 