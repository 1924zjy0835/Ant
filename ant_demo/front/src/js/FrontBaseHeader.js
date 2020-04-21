/*
 * @Description: FrontBaseHeader.js
 * @Author: 孤烟逐云zjy
 * @Date: 2020/3/25 12:26
 * @SoftWare: PyCharm
 * @CSDN: https://blog.csdn.net/zjy123078_zjy
 * @博客园: https://www.cnblogs.com/guyan-2020/
 */

// 定义构造函数FrontBaseHeader
function FrontBase() {

}


// 该类对象的入口
FrontBase.prototype.run = function () {
    var self = this;
    self.listenAuthBoxHover();
};

FrontBase.prototype.listenAuthBoxHover = function () {
    var authBox = $(".auth-box");
    var userMoreBox = $(".user-more-box");

    authBox.hover(function () {
        userMoreBox.show();
    }, function () {
        userMoreBox.hide();
    });
};


// 定义一个监听按钮登录和注册功能和关闭按钮的事件
// $(function () {
//     $("#btn").click(function () {
//         $(".mask-wrapper").show();
//     });
//     $(".close-btn").click(function () {
//         $(".mask-wrapper").hide();
//     });
// });


// 定义构造函数Auth
function Auth() {
    this.siginBtn = $(".signin-btn");
    this.signupBtn = $(".signup-btn");
    this.closeBtn = $(".closeBtn");
    this.maskWrapper = $(".mask-wrapper");
    this.scrollWrapper = $(".scroll-wrapper");
    this.signinGroup = $(".signin-group");
    this.signupGroup = $('.signup-group');
}

Auth.prototype.run = function () {
    this.listenShowHideEvent();
    this.listenCloseBtn();
    this.listenSignInEvent();
    this.listenImgCaptchaEvent();
    this.listenSmsCaptchaEvent();
    this.listenSignupEvent();
};

// 定义监听点击显示事件
Auth.prototype.showEvent = function () {
    var self = this;
    self.maskWrapper.show();
};

// 定义监听隐藏事件
Auth.prototype.hideEvent = function () {
    var self = this;
    self.maskWrapper.hide();
};

// 定义点击事件
Auth.prototype.listenShowHideEvent = function () {
    var self = this;
    self.siginBtn.click(function () {
        self.showEvent();
        self.scrollWrapper.css({"left": "0"});
    });
    self.signupBtn.click(function () {
        self.showEvent();
        self.scrollWrapper.css({"left": "-400px"});
    });
    self.closeBtn.click(function () {
        self.hideEvent();
    });

};

// 定义监听登录和注册页面之间的跳转事件
Auth.prototype.listenCloseBtn = function () {
    var switcher = $(".switch");
    var self = this;
    switcher.click(function () {
        var wrapperLeft = self.scrollWrapper.css("left");
        // 一定要将获取到的wrapperLeft的值（像素值）转换为整数，否者的话，不能进行与0比较
        var currentLeft = parseInt(wrapperLeft);
        if (currentLeft < 0) {
            self.scrollWrapper.animate({"left": "0"});
        } else {
            self.scrollWrapper.animate({"left": "-400px"});
        }
    });
};

// 监听提交上来的登录数据
Auth.prototype.listenSignInEvent = function () {
    var self = this;
    var telephoneInput = self.signinGroup.find("input[name='telephone']");
    var passwordInput = self.signinGroup.find("input[name='password']");

    var rememberInput = self.signinGroup.find("input[name='remember']");

    var submitBtn = self.signinGroup.find(".submit-btn");
    submitBtn.click(function () {
        var telephone = telephoneInput.val();
        var password = passwordInput.val();
        var remember = rememberInput.prop("checked");

        antajax.post({
            'url': '/account/login/',
            'data': {
                'telephone': telephone,
                'password': password,
                // 使用三目运算符
                'remember': remember ? 1 : 0,
            },
            'success': function (result) {
                // 重新刷新windows页面
                if (result['code'] === 200) {
                    // 登录成功，就隐藏maskwrapper
                    self.hideEvent();
                    window.location.reload();
                }
            },
        });
    });
};

Auth.prototype.listenSignupEvent = function () {
    var self = this;
    var submitBtn = self.signupGroup.find(".submit-btn");
    submitBtn.click(function () {
        var telephoneInput = self.signupGroup.find("input[name='telephone']");
        var usernameInput = self.signupGroup.find("input[name='username']");
        var passwordInput = self.signupGroup.find("input[name='password']");
        var repeat_passwordInput = self.signupGroup.find("input[name='repeat_password']");
        var img_captchaInput = self.signupGroup.find("input[name='img_captcha']");
        var sms_captchaInput = self.signupGroup.find("input[name='sms_captcha']");

        var telephone = telephoneInput.val();
        var username = usernameInput.val();
        var password = passwordInput.val();
        var repeat_password = repeat_passwordInput.val();
        var img_captcha = img_captchaInput.val();
        var sms_captcha = sms_captchaInput.val();

        antajax.post({
            'url': '/account/register/',
            'data': {
                'telephone': telephone,
                'username': username,
                'password': password,
                'repeat_password': repeat_password,
                'img_captcha': img_captcha,
                'sms_captcha': sms_captcha,
            },
            'success': function (result) {
                //    关闭form表单默认的提交事件
                if (result['code'] === 200) {
                    window.location.reload();
                } else {
                    window.close();
                }
            }
        });
    });
};

// 监听点击验证码切换事件
Auth.prototype.listenImgCaptchaEvent = function () {
    var img_captcha = $(".img_captcha");

    img_captcha.click(function () {
        img_captcha.attr("src", "/account/img_captcha/" + "?random=" + Math.random())
    });
};

Auth.prototype.smsSuccessEvent = function () {
    var self = this;
    var smsCaptcha = $('.sms-captcha-btn');
    messageBox.showSuccess('短信验证码发送成功！');
    smsCaptcha.addClass('disabled');
    var count = 10;
    // 清除点击事件，此时就不能再发送验证码了
    smsCaptcha.unbind('click');
    var timer = setInterval(function () {
        smsCaptcha.text("重新发送" + count + 's');
        count--;
        if (count <= 0) {
            clearInterval(timer);
            smsCaptcha.removeClass('disabled');
            smsCaptcha.text('发送验证码');
            self.listenSmsCaptchaEvent();
        }
    }, 1000);
};

// 监听验证码点击事件
Auth.prototype.listenSmsCaptchaEvent = function () {
    var self = this;
    var smsCaptcha = $('.sms-captcha-btn');
    var telephoneInput = $(".signup-group input[name='telephone']");
    // var telephoneInput = self.signupGroup.find("input[name='telephone']");

    smsCaptcha.click(function () {
        var telephone = telephoneInput.val();
        if (!telephone) {
            messageBox.showInfo('请输入手机号码！');
        }
        antajax.get({
            'url': '/account/sms_captcha/',
            'data': {
                'telephone': telephone
            },
            'success': function (result) {
                if (result['code'] === 200) {
                    self.smsSuccessEvent();
                    console.log(result);
                }
            },
            'fail': function (error) {
                console.log(error);
            }
        });
    });
};


$(function () {
    var auth = new Auth();
    auth.run();
});

$(function () {
    var frontBase = new FrontBase();
    frontBase.run();
});

$(function () {
    // 首先需要判断是否加载了这个template文件，只有加载了，才会执行以下代码
    if (template) {
        template.defaults.imports.dateFormat = function (dateValue) {
            var dateStamp = (new Date(dateValue)).getTime(); // 得到的是当前的时间，毫秒
            var dateStampNow = (new Date()).getTime(); // 获取当前的时间，毫秒
            var timeStamp = (dateStampNow - dateStamp) / 1000; // 获取时间戳
            if (timeStamp < 60) {
                return "刚刚";
            } else if (timeStamp >= 60 && timeStamp < 60 * 60) {
                minutes = parseInt(timeStamp / 60);
                return minutes + "分钟前";
            } else if (timeStamp >= 60 * 60 && timeStamp < 60 * 60 * 24) {
                hours = parseInt(timeStamp / 60 / 60);
                return hours + "小时前";
            } else if (timeStamp >= 60 * 60 * 24 && timeStamp < 60 * 60 * 24 * 30) {
                days = parseInt(timeStamp / 60 / 60 / 24);
                return days + "天前";
            } else {
                // js文件中不能使用这种形式返回字符串
                // return dateValue.strftime("%Y/%m/%d %H:%M");
                var date = new Date(dateValue);
                var year = date.getFullYear();
                var month = date.getMonth();
                var day = date.getDay();
                var hour = date.getHours();
                var minutes = date.getMinutes();

                return year + '/' + month + '/' + day + ' ' + hour + ':' + minutes;

            }
        }
    }
});