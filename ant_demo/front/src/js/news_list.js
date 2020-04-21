
function CMSNewsList() {

}

CMSNewsList.prototype.run = function () {
    this.listenDatePickerEvent();

};

CMSNewsList.prototype.listenDatePickerEvent = function () {
    var startPicker = $("#start-picker");
    var endPicker = $("#end-picker");
    // 得到今天的日期对象
    var todayDate = new Date();
    // JavaScript getMonth()方法返回月份，1月为0，二月为1，以此类推，所以此处需要加1
    // 此处将日期选择加1，因为获取到的todayDate.getDate()为当日的0点，所以如果end_time为今天的0点，那么就不能查看今天的新闻了只能等到明天的0点之后才可以查看今天的新闻，
    // 所以需要将end_time,加1操作，这样的话就可以随意的选择今天的新闻了
    var todayPicker = todayDate.getFullYear() + '/' + (todayDate.getMonth()+1) + '/' + (todayDate.getDate()+1);

    var options = {
        // 是否需要展示日期的面板
        'showButtonPanel': true,
        // 将日期格式化为指定的类型
        'format': 'yyyy/mm/dd',
        // 指定面板中的日期开始的日期
        'startDate': '2020/1/1',
        // 指定结束的日期为今天
        'endDate': todayPicker,
        // 指定语言为中文
        'language': 'zh-CN',
        // 指定是否显示今日的按钮
        'todayBtn': 'linked',
        // 指定当前的日期是否高亮显示
        'todayHighlight': true,
        // 指定是否显示清除按钮
        'clearBtn': true,
        // 指定是否自动关闭面板
        'autoBtn': true,
    };

    startPicker.datepicker(options);
    endPicker.datepicker(options);
};

$(function () {
    var dateList = new CMSNewsList();
    dateList.run();
});