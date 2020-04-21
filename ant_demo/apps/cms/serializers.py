# @Description: serializers.py.py
# @Author: 孤烟逐云zjy
# @Date: 2020/4/13 17:30
# @SoftWare: PyCharm
# @CSDN: https://blog.csdn.net/zjy123078_zjy
# @博客园: https://www.cnblogs.com/guyan-2020/

from rest_framework import serializers
from .models import Banners


class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banners
        fields = ('id', 'priority', 'img_url', 'link_to')