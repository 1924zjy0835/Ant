/**
 * @Description: banners.js
 * @Author: 孤烟逐云zjy
 * @Date: 2020/4/12 10:44
 * @SoftWare: PyCharm
 * @CSDN: https://blog.csdn.net/zjy123078_zjy
 * @博客园: https://www.cnblogs.com/guyan-2020/
 */

function Banners() {

}

Banners.prototype.run = function () {
    this.listenAddBannersEvent();
    this.listenBannerListEvent();
};


Banners.prototype.listenBannerListEvent = function () {
    var self = this;
    antajax.get({
        'url': '/cms/banner/list/',
        'success': function (result) {
            if (result['code'] === 200) {
                // 获取数据库中所有的banners，已经经过序列化了
                var banners = result['data'];

                // 将每一个banner添加至art-template形成的模板中
                // 遍历每一个banner
                for (var i = 0; i < banners.length; i++) {
                    // 获取当前的banner
                    var banner = banners[i];
                    // 生成template模板
                    self.createBannerItemEvent(banner);
                }
            }
        }
    });
};


Banners.prototype.createBannerItemEvent = function (banner) {
    var self = this;
    var tpl = template("banner-item", {"banner": banner});
    // 并且将模板添加至banner-list-group
    var bannerListGroup = $(".banner-list-group");
    var bannerItem = null;
    if (banner) {
        // 将当前的banner添加至bannerListGroup的最后，使用append()
        bannerListGroup.append(tpl);
        // 获取获取banners-item中的最后的banner
        bannerItem = bannerListGroup.find(".banner-item:last");
    } else {
        bannerListGroup.prepend(tpl);
        bannerItem = bannerListGroup.find(".banner-item:first");
    }
    self.removeBannerEvent(bannerItem);
    self.listenAddImageEvent(bannerItem);
    self.listenSaveBannerEvent(bannerItem);
};

Banners.prototype.listenAddBannersEvent = function () {
    var self = this;
    var addBtn = $("#add-banner-btn");
    addBtn.click(function () {
        var bannerListGroup = $(".banner-list-group");
        var bannerLength = bannerListGroup.children().length;
        if (bannerLength >= 6) {
            window.messageBox.showInfo("只能添加6张轮播图哦");
            return;
        }
        self.createBannerItemEvent();
    });
};

// 监听图片上传到本地服务器
Banners.prototype.listenAddImageEvent = function (bannerItem) {
    var image = bannerItem.find(".thumbnail");
    var imageInput = bannerItem.find(".image-input");
    image.click(function () {
        // var imageInput = bannerItem.find(".image-input");  这种方式会获取所有的image-input标签
        // 可以通过拿到当前的image，之后获取他的兄弟元素中的特定标签

        // var nowThis = $(this); // 代表当前的类
        // var imageInput = nowThis.siblings(".image-input");
        imageInput.click();
    });

    // 选择图片，点击打开按钮，执行change事件
    imageInput.change(function () {
        var file = this.files[0];
        var formData = new FormData();
        formData.append("file", file);

        // 将图片上传至本地服务器
        antajax.post({
            'url': '/cms/upload_file/',
            'data': formData,
            'processData': false,
            'contentType': false,
            'success': function (result) {
                if (result['code'] === 200) {
                    var url = result['data']['url'];
                    image.attr("src", url);
                    // var linkTo = $("#link_to");
                    // linkTo.val(url);
                }
            }
        });
    });
};

// 监听删除按钮事件
Banners.prototype.removeBannerEvent = function (bannerItem) {
    var closeBtn = bannerItem.find(".close-btn");
    // bannerItem是空的轮播图的框架的时候，就会绑定移除轮播图事件
    // 此时获取到的bannerItem是没有banner-id的，所以如果刚新添加一个轮播图，但是没有刷新就要删除的话，
    // 就会在轮播图界面可以删除，但是不能够真正的在数据库中删除
    // var bannerId = bannerItem.attr("data-banner-id");

    closeBtn.click(function () {
        var bannerId = bannerItem.attr("data-banner-id");
        if (bannerId) {
            antalert.alertConfirm({
                'text': "您确定要删除该轮播图吗？无法撤销哦！~~~",
                'confirmCallback': function () {
                    antajax.post({
                        'url': '/cms/del/banner/',
                        'data': {
                            'banner_id': bannerId,
                        },
                        'success': function (result) {
                            if (result['code'] === 200) {
                                bannerItem.remove();
                                window.messageBox.showSuccess(result['message']);
                            }
                        }
                    });
                }
            });
        } else {
            bannerItem.remove();
        }
    });
};

// 监听保存事件
Banners.prototype.listenSaveBannerEvent = function (bannerItem) {
    var saveBanner = bannerItem.find(".save-btn");

    var imageTag = bannerItem.find(".thumbnail");
    var priorityTag = bannerItem.find("input[name='priority']");
    // 需要注意的是，link_to是id,不是name，如果写成了name就会造成code值为400，
    var linkToTag = bannerItem.find("input[name='link_to']");
    var bannerId = bannerItem.attr("data-banner-id");

    var url = "";
    if (bannerId) {
        url = '/cms/edit/banner/';
    } else {
        url = '/cms/add/banner/';
    }

    saveBanner.click(function () {
        var img_url = imageTag.attr('src');
        var priority = priorityTag.val();
        var link_to = linkToTag.val();

        antajax.post({
            'url': url,
            'data': {
                'img_url': img_url,
                'priority': priority,
                'link_to': link_to,
                'pk': bannerId,
            },
            'success': function (result) {
                if (result['code'] === 200) {
                    if (bannerId) {
                        window.messageBox.showSuccess(result['message']);
                    }else{
                        // 如果能够执行到这里，代表的是可以正常的返回给前端一个页面
                        // 但是这里我们只需要返回priority的值，即banner_id就可以了。
                        bannerId = result['data']['banner_id'];
                        // 将bannerId绑定到banner-item上
                        bannerItem.attr("data-banner-id", bannerId);
                        window.messageBox.showSuccess(result['message']);
                    }
                    var prioritySpan = bannerItem.find("span[class='priority']");
                    prioritySpan.text('优先级：' + priority);

                }else{
                    var codeError = result['code'];
                    console.log(codeError);
                    var messageInfo = result['message'];
                    console.log(messageInfo);
                }
            }
        });
    });
};


$(function () {
    var banners = new Banners();
    banners.run();
});