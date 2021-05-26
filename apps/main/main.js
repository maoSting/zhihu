let cutdownVue = new Vue({
    el: '#main',
    devtools: true,
    data: {
        items: [],
        layuiTool: null,
    },
    created() {
        this.init();
    },
    mounted() {
    },
    methods: {
        async init(e) {
            let that = this;
            let count = await this.getCount()
            this.layuiTool = layui.use(['laypage'], function () {
                let laypage = layui.laypage;
                //执行一个laydate实例
                laypage.render({
                    elem: 'page',
                    limit: 20,
                    count: count,
                    jump: async function (obj, first) {
                        that.items = await that.getData(obj.curr, obj.limit);
                    }
                });
            });
        },
        openPage(type) {
            let bgPage = chrome.extension.getBackgroundPage();
            bgPage.BgPageInstance.openPage(type);
        },
        getMessage(words, defaultMsg) {
            defaultMsg = defaultMsg || [];
            return chrome.i18n.getMessage(words, defaultMsg);
        },
        async getData(page, pageSize) {
            return new Promise(resolve => {
                let bgPage = chrome.extension.getBackgroundPage();
                bgPage.BgPageInstance.getRow(page, pageSize, resolve)
            });
        },
        async getCount() {
            return new Promise((resolve, reject) => {
                let bgPage = chrome.extension.getBackgroundPage();
                bgPage.BgPageInstance.getDataCount(resolve, reject)
            });
        },
        formDate(microsecond) {
            let date = new Date(microsecond);
            let month = (date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1);
            let day = date.getDay() >= 10 ? date.getDay() : '0' + date.getDay();
            let hour = date.getHours() >= 10 ? date.getHours() : '0' + date.getHours();
            let min = date.getMinutes() >= 10 ? date.getMinutes() : '0' + date.getMinutes();
            let sec = date.getSeconds() >= 10 ? date.getSeconds() : '0' + date.getSeconds();
            return date.getFullYear() + '-' + month + '-' + day + '  ' + hour + ':' + min + ':' + sec;
        }
    }
});
