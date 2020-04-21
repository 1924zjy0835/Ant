/**
 * @Description: release_news.js
 * @Author: 孤烟逐云zjy
 * @Date: 2020/4/2 9:00
 * @SoftWare: PyCharm
 * @CSDN: https://blog.csdn.net/zjy123078_zjy
 * @博客园: https://www.cnblogs.com/guyan-2020/
 */

function News() {

}

News.prototype.run = function () {
    // this.listenUploadFile();
    this.listenQiniuUploadFileEvent();
    this.initUEditor();
    this.listenReleaseNewsEvent();
};


// 监听上传的文件，上传至本地服务器
News.prototype.listenUploadFile = function () {
    var self = this;
    var uploadBtn = $("#thumbnail-btn");
    // 此时获取的uploadBtn是一个集合（返回所有满足：id=thumbnail-btn）
    // 当元素的值发生改变的时候，会发生change事件。change()函数触发change事件，或规定当发生change事件时运行的函数。
    uploadBtn.change(function () {
        var file = uploadBtn[0].files[0];
        var formData = new FormData();
        formData.append('file', file);
        antajax.post({
            'url': '/cms/upload_file/',
            'data': formData,
            'processData': false,
            'contentType': false,
            'success': function (result) {
                if (result['code'] === 200) {
                    var url = result['data']['url'];
                    var thumbnailForm = $("#thumbnail-form");
                    thumbnailForm.val(url);
                }
            }
        });
    });
};

// 处理上传进度的回调
News.prototype.handleFileUploadProcess = function (response) {
    var self = this;
    var total = response.total;
    var percent = total.percent;
    var percentText = percent.toFixed(0) + "%";
    var processGroup = News.processGroup;
    processGroup.show();

    var processBar = $(".progress-bar");
    processBar.css({"width": percentText});
    processBar.text(percentText);
};

// 处理文件上传错误时的回调
News.prototype.handleFileUploadError = function (error) {
    window.messageBox.showError(error);
};

// 处理文件上传成功时的回调
News.prototype.handleFileUploadComplete = function (response) {
    // 图片上传成功时，隐藏掉
    var processGroup = $("#process-group");
    processGroup.hide();

    // 将图片的url存放在输入框中
    var domain = 'http://q87jey5py.bkt.clouddn.com/';
    var filename = response.key;
    var url = domain + filename;
    var thumbnailForm = $("#thumbnail-form");
    thumbnailForm.val(url);
};

News.prototype.listenQiniuUploadFileEvent = function () {
    var self = this;
    var thumbnailBtn = $("#thumbnail-btn");
    thumbnailBtn.change(function () {
        var file = this.files[0];

        // 将上传的文件按照.进行切割，以数组中的最后一个作为后缀名
        var fileLength = file.name.split('.').length;
        var suffixName = file.name.split('.')[fileLength - 1];
        // 通过get请求获取token
        antajax.get({
            'url': '/cms/qntoken/',
            'success': function (result) {
                if (result['code'] === 200) {
                    var key = (new Date()).getTime() + '.' + suffixName;
                    var token = result['data']['token'];
                    var putExtra = {
                        fname: key,
                        params: {},
                        // mimeType: ['image/png', 'image/jpeg', 'image/gif', 'video/x-ms-wmv'],
                        mimeType: ['image/png', 'image/jpeg', 'image/gif'],
                    };
                    var config = {
                        useCdnDomain: true,
                        retryCount: 6,
                        region: qiniu.region.z2
                    };
                    var observable = qiniu.upload(file, key, token, putExtra, config);
                    observable.subscribe({
                        'next': self.handleFileUploadProcess,
                        'error': self.handleFileUploadError,
                        'complete': self.handleFileUploadComplete,
                    });
                }
            }
        });
    });
};


News.prototype.initUEditor = function () {
    window.ue = UE.getEditor('UEditor', {
        'initialFrameHeight': 400,
        'serverUrl': '/ueditor/upload/',
    });
};

News.prototype.listenReleaseNewsEvent = function () {
    var submitBtn = $("#submit-Btn");
    submitBtn.click(function (event) {
        event.preventDefault();

        var title = $("input[name='title']").val();
        var desc = $("input[name='desc']").val();
        var thumbnail = $("input[name='thumbnail']").val();
        var category = $("select[name='category']").val();
        var content = window.ue.getContent();

        antajax.post({
            'url': "/cms/release_news/",
            'data': {
                'title': title,
                'desc': desc,
                'thumbnail': thumbnail,
                'content': content,
                'category': category,
            },
            'success': function (result) {
                if (result['code'] === 200) {
                    antalert.alertSuccess("小可爱，你的新闻已经添加完成了哦！~~", function () {
                        window.location.reload();
                    });
                }
            }
        });
    });
};


$(function () {
    var news = new News();
    news.run();
    News.processGroup = $("#process-group");
});