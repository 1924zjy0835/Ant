from django.urls import path
from . import views

app_name = "antAuth"

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('img_captcha/', views.img_Captcha, name='img_captcha'),
    path('sms_captcha/', views.sms_sender, name='sms_captcha'),
    path('register/', views.register_view, name='register'),
    path('cache/', views.cache_test, name='cache'),
]