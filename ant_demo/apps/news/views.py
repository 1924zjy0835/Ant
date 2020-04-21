from django.shortcuts import render
from .models import News, NewsCategory, Comment
from django.conf import settings
from utils import restful
from .serializers import NewsSerializer, CommentSerializer
from django.http import HttpResponse, Http404
from .forms import CommentForm

from django.contrib.auth.decorators import login_required
from apps.antAuth.decorators import ant_login_required

from apps.cms.models import Banners


def index(request):
    count = settings.ONE_PAGE_NEWS_COUNT
    # 将新闻按照发布的时间排序，并且选择count条最新的新闻展示
    # 使用order_by排序之后得到的是QuerySet对象，之后就可以使用切片操作将其切成count大小
    # newses = News.objects.order_by('-pub_time')
    # print(type(newses))

    # 按照pub_time排序，在models.py文件中指定ordering=['-pub_time']
    newses = News.objects.select_related('category', 'author').all()[0:count]
    news_categories = NewsCategory.objects.all()
    context = {
        'newses': newses,
        'news_categories': news_categories,
        'banners': Banners.objects.all(),
    }
    return render(request, 'news/../../front/templates/common/index.html', context=context)


def news_list(request):
    """
    通过p参数来指定要获取第几页的数据，p参数是通过查询字符串的方式传递过来的
    切片操作之后得到的是QuerySet对象，通过values()获取
    newses = News.objects.order_by('-pub_time')[start: end].values()
    for news in newses:
        print(news)
    return restful.ok()
    """
    # return HttpResponse('Success!')

    # 定义page变量，在url中通过p参数显示，并且默认值为1
    page = int(request.GET.get('p', 1))
    # 在models.py文件中已经指定了排序方式按照pub_time
    # 分类为0，代表不进行任何分类，直接按照时间倒序排序
    category_id = int(request.GET.get('category_id', 0))

    start = (page-1)*settings.ONE_PAGE_NEWS_COUNT
    end = start + settings.ONE_PAGE_NEWS_COUNT

    # 如果分类为0，就将所有的新闻取出来，并且按页显示
    if category_id == 0:
        # 将我们需要序列化的数据传输我们定义的序列化的类中，并且指定many=True，代表有很多的数据需要序列化
        # 查询出来的结果为一个QuerySet对象，在进行序列化的时候要指定many=True
        newses = News.objects.select_related('category', 'author').all()[start: end]
    # 如果分类不为0，就按照分类id将其选择出来，分页显示
    else:
        newses = News.objects.select_related('category', 'author').filter(category_id=category_id)[start:end]
    serializers = NewsSerializer(newses, many=True)
    data = serializers.data
    return restful.httpResult(data=data)


def news_detail(request, news_id):
    try:
        news = News.objects.select_related('category', 'author').prefetch_related('comment__author').get(pk=news_id)
        context = {
            'news': news,
        }
        return render(request, 'news/news_detail.html', context=context)
    except News.DoesNotExist:
        raise Http404


# 定义发布评论的视图函数
@ant_login_required
def publish_comment(request):
    form = CommentForm(request.POST)
    if form.is_valid():
        news_id = form.cleaned_data.get('news_id')
        content = form.cleaned_data.get('content')
        # 判断是否能够从数据库表中找到news_id的一条数据，如果不可以找到的话，就返回404页面
        news = News.objects.get(pk=news_id)
        # comment是一个对象
        comments = Comment.objects.create(content=content, news=news, author=request.user)
        serizlizeData = CommentSerializer(comments)
        return restful.httpResult(data=serizlizeData.data)
    else:
        return restful.params_error(message=form.get_errors())


def http4(request):
    return render(request, '404.html')


def search(request):
    return render(request, 'search/search.html')

