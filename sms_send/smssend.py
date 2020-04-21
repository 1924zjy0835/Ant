# @Description: smssend.py
# @Author: 孤烟逐云zjy
# @Date: 2020/3/28 21:55
# @SoftWare: PyCharm
# @CSDN: https://blog.csdn.net/zjy123078_zjy
# @博客园: https://www.cnblogs.com/guyan-2020/

import requests


def send(mobile, code):
    url = "http://v.juhe.cn/sms/send"

    params = {
        'mobile': mobile,
        'tpl_id':
    }
