let cutdownVue = new Vue({
    el: '#main',
    devtools: true,
    data: {
        items: [],
        current: null,
        saveKey: "saveKey",
        layuiTool: null,
        banTime: '00:00:00',
        addTime: null,
        addTitle: null,
    },
    created: function () {
        this.init();
    },
    mounted: function () {
    },
    methods: {
        init: function (e) {
            let that = this;
            this.layuiTool = layui.use(['laypage'], function () {
                let laypage = layui.laypage;
                //执行一个laydate实例
                laypage.render({
                    elem: 'page',
                    limit: 1,
                    count: that.getCount(),
                    jump: function(obj, first){
                        console.log(obj);
                        console.log(first);
                    }
                });
            });
        },
        openPage: function (type) {
            let bgPage = chrome.extension.getBackgroundPage();
            bgPage.BgPageInstance.openPage(type);
        },
        getMessage: function (words, defaultMsg) {
            defaultMsg = defaultMsg || [];
            return chrome.i18n.getMessage(words, defaultMsg);
        },
        getCount: function () {
            let bgPage = chrome.extension.getBackgroundPage();
            let countNum = 0;
            bgPage.BgPageInstance.getDataCount(function(count){
                countNum = count;
            });
            console.log('countNum');
            console.log(countNum);
        },
    }
});
