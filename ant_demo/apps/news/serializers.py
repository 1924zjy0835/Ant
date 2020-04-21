# @Description: serializers.py
# @Author: 孤烟逐云zjy
# @Date: 2020/4/5 20:23
# @SoftWare: PyCharm
# @CSDN: https://blog.csdn.net/zjy123078_zjy
# @博客园: https://www.cnblogs.com/guyan-2020/

from rest_framework import serializers
from .models import News, NewsCategory, Comment
from apps.antAuth.serializers import UserSerializer


class NewsCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsCategory
        fields = ('id', 'category_name')


class NewsSerializer(serializers.ModelSerializer):
    category = NewsCategorySerializer()
    author = UserSerializer()

    class Meta:
        model = News
        fields = ('id', 'title', 'desc', 'thumbnail', 'pub_time', 'category', 'author')


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer()

    class Meta:
        model = Comment
        fields = ('id', 'content', 'author', 'pub_time')
