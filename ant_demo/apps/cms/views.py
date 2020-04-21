from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.views.generic import View
from django.views.decorators.http import require_POST, require_GET
from apps.news.models import NewsCategory, News
from utils import restful
from apps.cms.forms import EditNewsCategoryForm, ReleaseForm

import os
from django.conf import settings

import qiniu

from django.conf import settings

from .forms import BannerForm, EditBannerForm
from .models import Banners
from .serializers import BannerSerializer


# 实现分页
from django.core.paginator import Paginator
from django.core.paginator import Page

# 将日期格式化
from datetime import datetime
# 将不清醒的时间转换为清醒的时间
from django.utils.timezone import make_aware

# 将参数转换为url的形式
from urllib import parse


# 后台首页视图
@staff_member_required(login_url='index')
def cms_index(request):
    return render(request, 'cms/index.html')


# 通过继承ListView实现类视图，只能够接收一个p参数，不能够接收传入的title、时间等信息
# 可以通过继承View类来实现
class news_list(View):

    def get(self, request):
        newses = News.objects.select_related("category", 'author')

        start = request.GET.get('start')
        end = request.GET.get('end')
        title = request.GET.get('title')
        # request.GET获取的参数为字符串形式，在html中进行判断的时候，是整形的判断，所以需要转换为整形
        # 默认值0，只有在没有传递任何值的时候，才会使用，如果传递了空的字符串，也不会使用默认值
        category_id = int(request.GET.get('category', 0) or 0)

        # 首先筛选出符合日期的新
        if start or end:
            if start:
                startTime = datetime.strptime(start, "%Y/%m/%d")
            else:
                startTime = datetime(year=2020, month=1, day=1)
            if end:
                endTime = datetime.strptime(end, "%Y/%m/%d")
            else:
                endTime = datetime.today()

            start_time = make_aware(startTime)
            end_time = make_aware(endTime)
            newses = newses.filter(pub_time__range=(start_time, end_time))

        if title:
            newses = newses.filter(title__icontains=title)

        if category_id:
            newses = newses.filter(category=category_id)

        # 利用page函数取到newses(可以遍历的QuerySet对象，每两条数据为一页)
        pagenator = Paginator(newses, 1)
        # 拿到当前这页，如果没有传递值，默认情况下为1
        page = int(request.GET.get('p', 1))
        # 获取当前这页的对象
        page_obj = pagenator.page(page)

        context_data = self.get_pagination_data(pagenator, page_obj)

        context = {
            'categories': NewsCategory.objects.all(),
            'newses': page_obj.object_list,
            # ListView会将page_obj、pagenatior自动传递给html模板
            # View不会传递，需要手动的传递
            'pagenator': pagenator,
            'page_obj': page_obj,
            'start': start,
            'end': end,
            'category_id': category_id,
            'title': title,
            'url': '&' + parse.urlencode({
                'start': start or '',
                'end': end or '',
                'title': title or '',
                'category': category_id or '',
            }),
        }
        context.update(context_data)
        return render(request, 'cms/news_list.html', context=context)

    def get_pagination_data(self, paginator, page_obj, around_count=2):
        current_page = page_obj.number
        num_pages = paginator.num_pages

        left_has_more = False
        right_has_more = False

        if current_page <= around_count + 2:
            left_pages = range(1, current_page)
        else:
            left_has_more = True
            left_pages = range(current_page - around_count, current_page)

        if current_page >= num_pages - around_count - 1:
            right_pages = range(current_page+1, num_pages+1)
        else:
            right_has_more = True
            right_pages = range(current_page + 1, current_page + around_count + 1)

        return {
            'left_pages': left_pages,
            'right_pages': right_pages,
            'num_pages': num_pages,
            'left_has_more': left_has_more,
            'right_has_more': right_has_more,
            'current_page': current_page,
        }


# 新闻分类视图
class release_news(View):

    def get(self, request):
        categories = NewsCategory.objects.all()
        context = {
            'categories': categories,
        }
        return render(request, 'cms/release_news.html', context=context)

    def post(self, request):
        form = ReleaseForm(request.POST)
        if form.is_valid():
            title = form.cleaned_data.get('title')
            desc = form.cleaned_data.get('desc')
            thumbnail = form.cleaned_data.get('thumbnail')
            content = form.cleaned_data.get('content')
            category_id = form.cleaned_data.get('category')
            category = NewsCategory.objects.get(pk=category_id)

            News.objects.create(title=title, desc=desc, thumbnail=thumbnail, content=content, category=category,
                                author=request.user)
            return restful.ok()

        else:
            return restful.params_error(message=form.get_error())


@require_POST
def upload_files(request):
    # 从request.FILES中获取真实的文件，这个字典的每一个输入都是一个UploadFile对象（一个上传后的文件的简单包装）
    files = request.FILES.get('file')
    name = files.name

    # with open函数打开文件的各种方式：（默认的方式）r:以只读的方式打开；
    # w：以打开一个文件只用于写入，如果该文件已经存在，就将其覆盖。如果该文件不存在，创建新文件；
    # a：打开一个文件用于追加，如果文件存在，文件指针将会放在文件的结尾，会将新的内容写入到已有的内容之后。如果该文件不存在，创建新文件进行写入
    # rb: 以二进制格式打开一个文件用于只读。文件指针将会放在文件的开头，这是默认的模式。
    # wb：以二进制格式打开一个文件只用于写入。如果文件已经存在将其覆盖。如果该文件不存在，创建新文件。
    # ab: 以二进制格式打开一个文件用于追加。如果该文件已存在，文件指针将会放在文件的结尾。也就是说，新的内容会被写入到已有的内容之后，如果该文件不存在，创建新文件进行写入。
    # r+: 打开一个文件用于读写，文件指针将会放在文件的开头。
    # w+: 打开一个文件用于读写。如果该文件已存在，则将其覆盖。如果不存在，将创建新文件。
    # a+: 打开一个文件用于读写。如果该文件已存在，文件指针将会放在文件的结尾。文件打开时会是追加模式。如果该文件不存在，创建新文件用于读写。
    # rb+: 以二进制格式打开一个文件用于读写。文件指针将会放在文件的开头。
    # wb+: 以二进制格式打开一个文件用于读写。如果该文件已存在则将其覆盖。如果该文件不存在，创建新文件。
    # ab+: 以二进制格式打开一个文件用于追加。如果该文件已存在，文件指针将会放在文件的结尾。如果文件不存在，创建新文件用于读写。

    with open(os.path.join(settings.MEDIA_ROOT, name), 'wb') as fp:
        # UploadFile.read(): 从文件中读取整个上传的数据。如果文件很大，你把它读到内存中就会使系统速度减慢，
        # UploadFile.chunks(): 如果上传的文件足够大需要分块就返回真。默认这个值为2.5M, 这个值是可以调节的。
        for chunk in files.chunks():
            fp.write(chunk)
        fp.close()
    url = request.build_absolute_uri(settings.MEDIA_URL + name)
    return restful.httpResult(data={'url': url})


@require_GET
def qnTaken(request):
    access_key = settings.QINIU_ACCESS_KEY
    secret_key = settings.QINIU_SECRET_KEY

    bucket = 'cdant'
    qn = qiniu.Auth(access_key, secret_key)

    token = qn.upload_token(bucket)

    return restful.httpResult(data={'token': token})


# 新闻分类
@require_GET
def news_category_view(request):
    categories = NewsCategory.objects.all()
    context = {
        'categories': categories,
    }
    return render(request, 'cms/news_category.html', context=context)


# 添加新闻分类
@require_POST
def add_news_category(request):
    name = request.POST.get('category_name')
    exists = NewsCategory.objects.filter(category_name=name).exists()
    if not exists:
        NewsCategory.objects.create(category_name=name)
        return restful.ok()
    else:
        return restful.params_error(message='该分类已经存在！')


# 编辑分类
# @require_POST
def edit_news_category(request):
    form = EditNewsCategoryForm(request.POST)
    if form.is_valid():
        pk = form.cleaned_data.get('pk')
        category_name = form.cleaned_data.get('category_name')
        exists = NewsCategory.objects.filter(category_name=category_name).exists()
        if not exists:
            NewsCategory.objects.filter(pk=pk).update(category_name=category_name)
            return restful.ok()
        else:
            return restful.params_error(message="该分类已经存在！")
    else:
        return restful.params_error(message=form.get_error())


# 删除分类
@require_POST
def delete_news_category(request):
    pk = request.POST.get('pk')
    try:
        NewsCategory.objects.filter(pk=pk).delete()
        return restful.ok()
    except:
        return restful.params_error(message="该分类不存在！")


# 轮播图管理
def banners_view(request):
    return render(request, 'cms/banners.html')


# 轮播图列表展示
def banner_list(request):
    banners = Banners.objects.all()

    # 将QuerySet类型的数据序列化为json data
    # 指定many=True,可以将多个字段进行序列化
    serializer = BannerSerializer(banners, many=True)
    return restful.httpResult(data=serializer.data)


def banner_add(request):
    form = BannerForm(request.POST)
    if form.is_valid():
        img_url = form.cleaned_data.get('img_url')
        link_to = form.cleaned_data.get('link_to')
        priority = form.cleaned_data.get('priority')

        prioExist = Banners.objects.filter(priority=priority).exists()
        if not prioExist:
            banner = Banners.objects.create(img_url=img_url, link_to=link_to, priority=priority)
            return restful.httpResult(message="轮播图信息已经添加成功了！~~~",data={'banner_id': banner.pk})
        else:
            return restful.httpResult(message="您添加的轮播图优先级已经存在了~~~")
    else:
        return restful.params_error(message=form.get_errors())


# 定义删除banner视图函数
def banner_del(request):
    banner_id = request.POST.get('banner_id')
    Banners.objects.filter(pk=banner_id).delete()
    return restful.httpResult(message="你要删除的轮播图，已经删除成功！~~ ^_^")


def banner_edit(request):
    form = EditBannerForm(request.POST)
    if form.is_valid():
        pk = form.cleaned_data.get('pk')
        img_url = form.cleaned_data.get('img_url')
        link_to = form.cleaned_data.get('link_to')
        priority = form.cleaned_data.get('priority')
        Banners.objects.filter(pk=pk).update(img_url=img_url, link_to=link_to, priority=priority)
        return restful.httpResult(message="轮播图信息已经修改成功了！~~~")
    else:
        return restful.params_error(message=form.get_errors())
