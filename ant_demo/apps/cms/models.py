from django.db import models


class Banners(models.Model):
    img_url = models.URLField()
    link_to = models.URLField()
    priority = models.IntegerField(default=0, unique=True)
    pub_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'banners'
        ordering = ['-priority']