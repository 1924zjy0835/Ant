# Generated by Django 3.0.3 on 2020-04-14 06:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cms', '0003_auto_20200414_1352'),
    ]

    operations = [
        migrations.AlterField(
            model_name='banners',
            name='img_url',
            field=models.URLField(),
        ),
    ]
