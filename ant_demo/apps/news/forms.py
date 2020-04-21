# @Description: forms.py
# @Author: 孤烟逐云zjy
# @Date: 2020/4/7 9:04
# @SoftWare: PyCharm
# @CSDN: https://blog.csdn.net/zjy123078_zjy
# @博客园: https://www.cnblogs.com/guyan-2020/
from django import forms
from apps.forms import FormMixin


class CommentForm(forms.Form, FormMixin):
    content = forms.CharField()
    news_id = forms.IntegerField()


