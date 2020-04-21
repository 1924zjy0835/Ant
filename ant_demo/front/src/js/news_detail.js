/**
 * @Description: news_detail.js
 * @Author: 孤烟逐云zjy
 * @Date: 2020/4/7 9:57
 * @SoftWare: PyCharm
 * @CSDN: https://blog.csdn.net/zjy123078_zjy
 * @博客园: https://www.cnblogs.com/guyan-2020/
 */

function CommentList() {

}

CommentList.prototype.run = function () {
    this.listenCommentPublishEvent();

};

CommentList.prototype.listenCommentPublishEvent = function () {
    var commentBtn = $(".btn");
    // 最好在点击事件外面获取评论的框
    var commentContent = $("textarea[name='comment']");
    commentBtn.click(function () {
        // 点击事件的时候获取里面输入的内容
        var content = commentContent.val();
        var news_id = commentBtn.attr("data-news_id");


        antajax.post({
            'url': '/news/publish/comment/',
            'data': {
                'content': content,
                'news_id': news_id,
            },
            'success': function (result) {
                if (result['code'] === 200) {
                    var comment = result['data'];
                    // 使用art-template创建一个模板
                    var tpl = template('comment-item', {'comment': comment});
                    var commentListGroup = $(".comment-list");
                    commentListGroup.prepend(tpl);
                    window.messageBox.showSuccess("小可爱，你的评论成功了哟！");
                    commentContent.val("");
                } else {
                    window.messageBox.showError(result['message']);
                }
            }
        });
    });
};

$(function () {
    var commentList = new CommentList();
    commentList.run();
});