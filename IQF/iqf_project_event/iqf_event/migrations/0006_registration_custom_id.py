# Generated by Django 4.2.9 on 2024-01-18 23:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('iqf_event', '0005_registration_presence'),
    ]

    operations = [
        migrations.AddField(
            model_name='registration',
            name='custom_id',
            field=models.IntegerField(blank=True, null=True, unique=True),
        ),
    ]
