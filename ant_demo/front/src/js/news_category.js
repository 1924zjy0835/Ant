/**
 * @Description: news_category.js
 * @Author: 孤烟逐云zjy
 * @Date: 2020/3/31 18:43
 * @SoftWare: PyCharm
 * @CSDN: https://blog.csdn.net/zjy123078_zjy
 * @博客园: https://www.cnblogs.com/guyan-2020/
 */

function NewsCategory() {

}

NewsCategory.prototype.run = function () {
    var self = this;
    self.listenAddNewsCategoryEvent();
    self.listenEditNewsCategoryEvent();
    self.listenDeleteCategoryEvent();
};

NewsCategory.prototype.listenAddNewsCategoryEvent = function () {
    var self = this;
    var add_news_btn = $("#add-news-btn");
    add_news_btn.click(function () {
        antalert.alertOneInput({
            'title': "添加分类",
            'placeholder': '请输入要添加的分类',
            'confirmCallback': function (inputValue) {
                antajax.post({
                    'url': '/cms/add_news_category/',
                    'data': {
                        'category_name': inputValue,
                    },
                    'success': function (result) {
                        if (result['code'] === 200) {
                            window.location.reload();
                        } else {
                            antalert.close();
                        }
                    }
                });
            }
        });
    });
};

NewsCategory.prototype.listenEditNewsCategoryEvent = function () {
    var self = this;
    var edit_news_btn = $(".edit-news-btn");
    edit_news_btn.click(function () {
        var currentBtn = $(this);
        var tr = currentBtn.parent().parent();
        var pk = tr.attr('data-pk');
        var category_name = tr.attr('data-name');
        antalert.alertOneInput({
            'title': '编辑分类名称',
            'text': '请输入新的分类名称',
            'value': category_name,
            'confirmCallback': function (inputValue) {
                antajax.post({
                    'url': '/cms/edit_news_category/',
                    'data': {
                        'pk': pk,
                        'category_name': inputValue,
                    },
                    'success': function (result) {
                        if (result['code'] === 200) {
                            window.location.reload();
                        } else {
                            antalert.close();
                        }
                    }
                });
            }
        });
    })
    ;
};

NewsCategory.prototype.listenDeleteCategoryEvent = function () {
    var self = this;
    var delete_news_btn = $(".delete-news-btn");
    delete_news_btn.click(function () {
        var currentBtn = $(this);
        var tr = currentBtn.parent().parent();
        var pk = tr.attr("data-pk");
        var category_name = tr.attr("data-name");
        // 不询问用户直接删除
        // antajax.post({
        //     'url': '/cms/delete_news_category/',
        //     'data': {
        //         'pk': pk,
        //     },
        //     'success': function (result) {
        //         if (result['code'] === 200) {
        //             window.location.reload();
        //         }
        //     }
        // });

        // 询问用户是否确认删除
        antalert.alertConfirm({
            'title': '确定要删除《'+category_name+'》分类吗?',
            'confirmCallback': function () {
                antajax.post({
                    'url': '/cms/delete_news_category/',
                    'data': {
                        'pk': pk,
                    },
                    'success': function (result) {
                        if (result['code'] === 200) {
                            window.location.reload();
                        } else {
                            window.close();
                        }
                    }
                });
            }
            
        })
    });
};

$(function () {
    var newsCategory = new NewsCategory();
    newsCategory.run();
});