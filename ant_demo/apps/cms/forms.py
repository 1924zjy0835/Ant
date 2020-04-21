# @Description: forms.py
# @Author: 孤烟逐云zjy
# @Date: 2020/4/1 6:33
# @SoftWare: PyCharm
# @CSDN: https://blog.csdn.net/zjy123078_zjy
# @博客园: https://www.cnblogs.com/guyan-2020/

from django import forms
from apps.forms import FormMixin
from apps.news.models import News, NewsCategory
from .models import Banners


class EditNewsCategoryForm(forms.ModelForm):
    pk = forms.IntegerField(error_messages={"required": "必须传入分类的id！"})
    category_name = forms.CharField(max_length=100)

    class Meta:
        model = NewsCategory
        fields = '__all__'

    def get_error(self):
        errors = self.errors.get_json_data()
        new_errors = {}
        for key, message_dicts in errors.items():
            messages = []
            for message_dict in message_dicts:
                message = message_dict['message']
                messages.append(message)
            new_errors[key] = messages
        return new_errors


class ReleaseForm(forms.ModelForm, FormMixin):
    category = forms.IntegerField()

    class Meta:
        model = News
        exclude = ['category', 'author', 'pub_time']

        # 定义各个字段错误信息
        error_messages = {
            'title': {
                'required': '必须输入标题',
                'max_length': '最大长度不能超过200个字符',
            },
            'desc': {
                'required': '必须传入描述信息',
                'max_length': '最大的长度不能超过200个字符！',
            },
            'thumbnail': {
                'invalid': '输入的url无效',
                'required': '最大的长度不超过200个字符',
            },
        }

    def get_error(self):
        errors = self.errors.get_json_data()
        new_errors = {}
        for key, message_dicts in errors.items():
            messages = []
            for message_dict in message_dicts:
                message = message_dict['message']
                messages.append(message)
            new_errors[key] = messages
        return new_errors


class BannerForm(forms.ModelForm, FormMixin):
    class Meta:
        model = Banners
        fields = ['img_url', 'link_to', 'priority']


class EditBannerForm(forms.ModelForm, FormMixin):
    # 为了不和Django模型中的默认字段重复定义为pk
    pk = forms.IntegerField()

    class Meta:
        model = Banners
        fields = ("img_url", "link_to", "priority")

