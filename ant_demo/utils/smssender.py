# @Description: smssender.js
# @Author: 孤烟逐云zjy
# @Date: 2020/3/26 15:19
# @SoftWare: PyCharm
# @CSDN: https://blog.csdn.net/zjy123078_zjy
# @博客园: https://www.cnblogs.com/guyan-2020/

import requests


# 定义短信验证码发送的视图函数
def sms_sender(mobile, captcha):
    url = 'http://v.juhe.cn/sms/send'
    params = {
        "mobile": mobile,
        "tpl_id": "210702",
        "tpl_value": "#code#="+captcha,
        "key": "f269ba1115c5f35c6df13fc68cf2fd31",
    }

    response = requests.get(url, params=params)
    result = response.json()
    print(result)
    if result['error_code'] == 0:
        print("已发送")
        return True
    else:
        print("发送失败！")
        return False

