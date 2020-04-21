from django import forms
from .models import User
from django.core import validators
from apps.forms import FormMixin
from django.core.cache import cache


class LoginForm(forms.Form, FormMixin):
    telephone = forms.CharField(max_length=11, validators=[validators.RegexValidator(R"1[345678]\d{9}")])
    password = forms.CharField(max_length=30, min_length=6, error_messages={"max_length":"密码最长不超过30个字符！", "min_length": "密码最短不少于6个字符！"})
    # 该字段可填可不填
    remember = forms.IntegerField(required=False)


class RegisterForm(forms.Form, FormMixin):
    telephone = forms.CharField(max_length=11, validators=[validators.RegexValidator(R"1[345678]\d{9}")])
    username = forms.CharField(max_length=200)
    password = forms.CharField(max_length=30, min_length=6, error_messages={"max_length": "密码最长不超过30个字符！", "min_length": "密码最短不少于6个字符"})
    repeat_password = forms.CharField(max_length=30, min_length=6, error_messages={"max_length": "密码最长不超过30个字符！", "min_length": "密码最短不少于6个字符"})
    img_captcha = forms.CharField(max_length=6, min_length=4)
    sms_captcha = forms.CharField(max_length=6, min_length=4)

    def clean(self):
        cleaned_data = super(RegisterForm, self).clean()

        password = cleaned_data.get('password')
        repeat_password = cleaned_data.get('repeat_password')
        if password != repeat_password:
            raise forms.ValidationError("两次输入密码不一致！")

        img_captcha = cleaned_data.get("img_captcha")
        cached_img_captcha = cache.get(img_captcha.lower())
        if not cached_img_captcha:
            raise forms.ValidationError("图形验证码不正确")

        telephone = cleaned_data.get("telephone")
        sms_captcha = cleaned_data.get("sms_captcha")
        cached_sms_captcha = cache.get(telephone)
        if not cached_sms_captcha or cached_sms_captcha.lower() != sms_captcha.lower():
            raise forms.ValidationError("短信验证码输入不正确！")

        exists = User.objects.filter(telephone=telephone).exists()
        if exists:
            forms.ValidationError("该手机号码已经被注册了！")

        return cleaned_data



