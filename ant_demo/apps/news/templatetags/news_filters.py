# @Description: news_filters.py
# @Author: 孤烟逐云zjy
# @Date: 2020/4/5 17:26
# @SoftWare: PyCharm
# @CSDN: https://blog.csdn.net/zjy123078_zjy
# @博客园: https://www.cnblogs.com/guyan-2020/


from django import template
from datetime import datetime
# 这个now()方法，获取的是当前的知道自己是哪个时区的时间
# localtime()方法，将UTC时间转换为本地时间，通过settings.py文件中的TIME_ZONE
from django.utils.timezone import now as now_func, localtime

register = template.Library()


@register.filter
def time_since(value):
    """
    time距离现在的时间间隔
    1. 如果时间间隔小于1分钟，就显示刚刚
    2. 如果是大于1分钟小于1小时，就显示“xx分钟前”
    3. 如果是大于1小时小于24小时，就显示“xx小时前”
    4. 如果大于24小时小于30天，那么就显示“xx天前”
    5. 否者的话就显示具体时间 2020/1/3 16:34
    """
    if not isinstance(value, datetime):
        return value
    # now = datetime.now()   获取的是navie time
    now = now_func()
    # timedelay.total_seconds
    timestamp = (now - value).total_seconds()
    if timestamp < 60:
        return '刚刚'
    elif timestamp >= 60 and timestamp < 60*60:
        minutes = int(timestamp/60)
        return "%s分钟前" % minutes
    elif timestamp >= 60*60 and timestamp < 60*60*24:
        hours = int(timestamp/(60*60))
        return "%s小时前" % hours
    elif timestamp >= 60*60*24 and timestamp < 60*60*24*30:
        days = int(timestamp/(60*60*24))
        return "%s天前" % days
    else:
        return value.strftime("%Y/%m/%d %H:%M")


@register.filter
def time_format(value):
    if not isinstance(value, datetime):
        return value

    return localtime(value).strftime("%Y/%m/%d %H:%M:%S")

