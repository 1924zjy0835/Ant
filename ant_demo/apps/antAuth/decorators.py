# @Description: decorators.py
# @Author: 孤烟逐云zjy
# @Date: 2020/4/12 8:29
# @SoftWare: PyCharm
# @CSDN: https://blog.csdn.net/zjy123078_zjy
# @博客园: https://www.cnblogs.com/guyan-2020/
from django.shortcuts import render, redirect
from utils import restful


def ant_login_required(function):
    def wrapper(request, *args, **kwargs):
        if request.user.is_authenticated:
            return function(request, *args, *kwargs)
        else:
            if request.is_ajax():
                return restful.unauth_error(message="亲爱的！请登录哦！")
            else:
                return redirect('/')
    return wrapper
