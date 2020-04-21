# @Description: serializers.py
# @Author: 孤烟逐云zjy
# @Date: 2020/4/5 20:52
# @SoftWare: PyCharm
# @CSDN: https://blog.csdn.net/zjy123078_zjy
# @博客园: https://www.cnblogs.com/guyan-2020/

from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('uid', 'telephone', 'email', 'username', 'is_active', 'is_staff')