from django.urls import path
from .import views
from .views import release_news

app_name = 'cms'

urlpatterns = [
    path('', views.cms_index, name='cms_index'),
    # 注意，这里是将类转换为类视图，使用as_view()
    path('news/list/', views.news_list.as_view(), name='news_list'),
    path('release_news/', release_news.as_view(), name='release_news'),
    path('upload_file/', views.upload_files, name='upload_file'),
    path('qntoken/', views.qnTaken, name='qntaken'),
    path('news_category/', views.news_category_view, name='news_category'),
    path('add_news_category/', views.add_news_category, name='add_news_category'),
    path('edit_news_category/', views.edit_news_category, name='edit_news_category'),
    path('delete_news_category/', views.delete_news_category, name='delete_news_category'),
    path('banners/', views.banners_view, name='banners'),
    path('add/banner/', views.banner_add, name='banner_add'),
    path('del/banner/', views.banner_del, name='banner_del'),
    path('edit/banner/', views.banner_edit, name='banner_edit'),
    path('banner/list/', views.banner_list, name='banner_list'),
]