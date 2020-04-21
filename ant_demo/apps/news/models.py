from django.db import models
from shortuuidfield import ShortUUIDField


class NewsCategory(models.Model):
    category_name = models.CharField(max_length=100)


class News(models.Model):
    title = models.CharField(max_length=200)
    desc = models.CharField(max_length=200)
    # 默认情况下，urlfield的最大长度为200
    thumbnail = models.URLField()
    content = models.TextField()
    pub_time = models.DateTimeField(auto_now_add=True)
    category = models.ForeignKey('NewsCategory', on_delete=models.SET_NULL,null=True)
    author = models.ForeignKey('antAuth.User', on_delete=models.SET_NULL, null=True)

    class Meta:
        db_table = 'news'
        ordering = ['-pub_time']


class Comment(models.Model):
    content = models.TextField()
    pub_time = models.DateTimeField(auto_now_add=True)
    news = models.ForeignKey('News', on_delete=models.CASCADE, related_name='comment')
    author = models.ForeignKey('antAuth.User', on_delete=models.CASCADE)

    class Meta:
        db_table = 'comment'
        ordering = ['-pub_time']