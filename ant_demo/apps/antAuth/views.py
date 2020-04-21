from django.shortcuts import reverse, redirect
from django.http import HttpResponse
from .forms import LoginForm, RegisterForm
from django.contrib.auth import login, authenticate, logout
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from utils import restful

from utils.captcha.AntCaptcha import Captcha
from io import BytesIO

from django.core.cache import cache
from django.contrib.auth import get_user_model

from utils import smssender


User = get_user_model()


@require_POST
# 定义首页视图函数
def login_view(request):
    form = LoginForm(request.POST)
    if form.is_valid():
        telephone = form.cleaned_data.get('telephone')
        password = form.cleaned_data.get('password')
        remember = form.cleaned_data.get('remember')
        user = authenticate(request, telephone=telephone, password=password)
        if user:
            if user.is_active:
                login(request, user)
                if remember:
                    request.session.set_expiry(None)
                else:
                    request.session.set_expiry(0)
                # 返回200的状态码，就代表的是可以正常访问
                return restful.ok()
            else:
                # 用户已经被拉黑了，没有权限
                return restful.unauth_error(message="您的账号已被冻结")
        else:
            return restful.params_error(message="您输入的手机号或密码不正确")
    else:
        errors = form.get_errors()
        return restful.params_error(message=errors)


@require_POST
def register_view(request):
    form = RegisterForm(request.POST)
    if form.is_valid():
        telephone = form.cleaned_data.get("telephone")
        username = form.cleaned_data.get("username")
        password = form.cleaned_data.get("password")
        user = User.objects.create_user(telephone=telephone, username=username, password=password)
        login(request, user)
        return restful.ok()
    else:
        print(form.get_errors())
        return restful.params_error(message=form.get_errors())


# 定义退出视图函数
def logout_view(request):
    logout(request)
    return redirect(reverse('index'))


# 定义获取图形验证码的视图函数
def img_Captcha(request):
    # 首先产生一个text,image
    text, image = Captcha.gene_code()
    # 图片不能放在一个http response 中进行返回，只能放在数据流中返回，就需要借助io的一个对象
    # BytesIO: 相当于一个管道，用来传输图片的流数据
    out = BytesIO()
    # 调用image的save方法，将这个image对象保存到BytesIO中
    image.save(out, 'png')
    # 将BytesIO的文件指针移动到最开始的位置
    out.seek(0)

    response = HttpResponse(content_type='image/png')
    # 从BytesIO的管道中，读取出图片数据，保存到response对象上
    response.write(out.read())
    # // 当前文件指针的大小
    response['Content-length'] = out.tell()

    cache.set(text.lower(), text.lower(), 5*60)
    return response


def sms_sender(request):
    # /sms_captcha/?telephone=xxx
    telephone = request.GET.get('telephone')
    code = Captcha.gene_text()

    #  设置手机号码、验证码在服务器端的缓存时间为5分钟
    cache.set(telephone, code, 5*60)
    # result = smssender.sms_sender(telephone, code)

    print("验证码为：", code)

    return restful.ok()
    # if result:
    #     return restful.ok()
    # else:
    #     print("短信验证码：", code)
    #     return restful.params_error(message="短信验证码发送失败")


def cache_test(request):
    cache.set('username', 'guyan03', 60)
    result = cache.get('username')
    print(result)
    return HttpResponse('Success')