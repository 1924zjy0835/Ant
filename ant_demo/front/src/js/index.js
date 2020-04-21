// 创建Banner类
function Banner() {
    this.index = 1;
    this.bannerWidth = 260;
    this.bannerGroup = $("#banner-group");
    this.leftArrow = $(".left-arrow");
    this.rightArrow = $(".right-arrow");
    this.bannerUl = $("#banner-ul");
    this.bannerList = this.bannerUl.children("li");
    // 计算bannerul下面的li标签的个数
    this.bannerCount = this.bannerList.length;
    this.pagecontrol = $(".page-control");
}

Banner.prototype.animate = function () {
    var self = this;
    self.bannerUl.stop().animate({"left": -260*self.index}, 500);
    var index = self.index;
    if(index === 0){
        index = self.bannerCount-1;
    }else if(index === self.bannerCount+1){
        index = 0;
    }else{
        index = self.index-1;
    }
    // 图片轮播过去，小点点也应该处于激活的状态
    // 为当前的li标签添加class=active，并且找到兄弟节点移除addclass=active
    // $(obj).addClass("active").siblings().removeClass("active");其中$(obj)是listenPageControl函数中each()中function中的一个参数，
    // 所以在这里不能用
    // 通过children()获取li标签，通过eq()函数获取当前的第index张图片
    self.pagecontrol.children("li").eq(index).addClass("active").siblings().removeClass("active");

};

// 初始化banner
Banner.prototype.initBanner = function () {
    // 获取第一张图片和最后一张图片
    var self = this;
    var firstBanner = self.bannerList.eq(0).clone();
    var lastBanner = self.bannerList.eq(self.bannerCount-1).clone();
    // 将获取的图片添加到bannerul中
    self.bannerUl.append(firstBanner);
    self.bannerUl.prepend(lastBanner);
    self.bannerUl.css({"width": self.bannerWidth*(self.bannerCount+2), "left": -self.bannerWidth});
};

// 初始化小点点
Banner.prototype.initPageControl = function () {
    var self = this;
    for (var i = 0; i < self.bannerCount; i++) {
        var circle = $("<li></li>");
        self.pagecontrol.append(circle);

        if (i === 0) {
            circle.addClass("active");
        }
    }
    self.pagecontrol.css({"width": this.bannerCount * 10 + 2 * 6 + 12 * (self.bannerCount - 1)});
};

//
Banner.prototype.loop = function () {
    var self = this;
    // 定义一个定时器，保持图片2秒钟静止，之后再执行run函数
    self.timer = setInterval(function () {
        if (self.index >= self.bannerCount+1) {
            self.bannerUl.css({"left": -self.bannerWidth})
            self.index = 2;
        } else {
            self.index++;
        }
        self.animate();
    }, 2000);
};

// 执行点击箭头时图片的跳转
Banner.prototype.listenArrowClick = function () {
    var self = this;
    // 左箭头被点击
    self.leftArrow.click(function () {
        if (self.index === 0) {
            self.bannerUl.css({"left": -self.bannerCount*self.bannerWidth});
            self.index = self.bannerCount - 1;
        } else {
            self.index--;
        }
        self.animate();
    });
    self.rightArrow.click(function () {
        if (self.index === self.bannerCount + 1) {
            self.bannerUl.css({"left": -self.bannerWidth});
            self.index = 2;
        } else {
            self.index++;
        }
        self.animate();
    });
};

// 定义一个函数：箭头的显示与否
Banner.prototype.toggleArrow = function (isShow) {
    // var self = this;
    if (isShow) {
        this.leftArrow.show();
        this.rightArrow.show();
    } else {
        this.leftArrow.hide();
        this.rightArrow.hide();
    }
};


// 监听鼠标悬停在图片上
Banner.prototype.listenBannerHover = function () {

    var self = this;
    self.bannerGroup.hover(function () {
        // 关闭计时器
        clearInterval(self.timer);
        self.toggleArrow(true);
    }, function () {
        self.loop();
        self.toggleArrow(false);
    });
};

// 监听小点点点击事件
Banner.prototype.listenPageControl = function () {
    var self = this;
    // 利用find()函数找到ul下面的li标签，each()函数进行遍历每一个li标签
    // 遍历每一个li标签执行function()函数
    // function函数中传递两个参数，index、li标签对象obj
    self.pagecontrol.children("li").each(function (index, obj) {
        // console.log(index);
        // console.log(obj);
        // console.log("===========");
        // 将当前的li标签包装成一个对象
        // 当小点点被点击的时候需要执行的动作
        $(obj).click(function () {
            // 将当前点击的小点点的index赋值给当前的小点点
            // 因为当前的index值增加了1，所以此时的index应该等于index+1
            self.index = index+1;
            // 执行轮播的动作
            self.animate();
        });
    });
};

// 在Banner类上绑定一个方法
Banner.prototype.run = function () {
    this.loop();
    this.listenArrowClick();
    this.listenBannerHover();
    this.initPageControl();
    this.initBanner();
    this.listenPageControl();
};

// 新闻列表
function NewsAutoLoadMore() {
    this.page = 2;
    this.category_id = 0;
    this.loadMore = $("#load-more");


}

// 监听新闻列表之间的切换
NewsAutoLoadMore.prototype.listenCategorySwitchEvent = function () {
    var self = this;
    var tabGroup = $(".list-tab");
    tabGroup.children().click(function () {
        // this代表的是当前选中的这个li标签
        var li = $(this);
        var category_id = li.attr("data-category");
        var page = 1;
        antajax.get({
            'url': '/news/list/',
            'data': {
                'category_id': category_id,
                'p': page,
            },
            'success': function (result) {
                if (result['code'] === 200) {
                    var newses = result['data'];
                    var tpl = template("news-load-more", {'newses': newses});

                    var listInnerGroup = $(".list-inner-group");
                    // empty: 可以将这个标签下的所有子元素都删除掉；
                    listInnerGroup.empty();
                    listInnerGroup.append(tpl);
                    // 注意，这里已经不是1了
                    self.page = 2;
                    self.category_id = category_id;
                    li.addClass('active').siblings().removeClass('active');
                    self.loadMore.show();
                }
            }
        });
    });
};

// 监听加载更多的按钮
NewsAutoLoadMore.prototype.listenNewsLoadMore = function () {
    var self = this;
    self.loadMore.click(function () {
        antajax.get({
            'url': '/news/list/',
            'data': {
                'category_id': self.category_id,
                'p': self.page,
            },
            'success': function (result) {
                if (result['code'] === 200) {
                    var newses = result['data'];
                    if (newses.length > 0) {
                        var tpl = template("news-load-more", {'newses': newses});
                        var ul = $(".list-inner-group");
                        ul.append(tpl);
                        self.page ++;
                    } else {
                        self.loadMore.hide();
                    }
                }
            }
        })
    });
};

NewsAutoLoadMore.prototype.run = function () {
    var self = this;
    self.listenNewsLoadMore();
    self.listenCategorySwitchEvent();
};


// $()函数中执行的代码，是在网页中所有的元素都加载完毕之后，才会执行的
$(function () {
    var banner = new Banner();
    banner.run();

    var newsAutoLoadMore = new NewsAutoLoadMore();
    newsAutoLoadMore.run();
});