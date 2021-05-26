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
    created() {
        this.init();
    },
    mounted() {
    },
    methods: {
        async init(e) {
            let that = this;
            let count = await this.getCount()
            console.log('count');
            console.log(count);
            this.layuiTool = layui.use(['laypage'], function () {
                let laypage = layui.laypage;
                //执行一个laydate实例
                laypage.render({
                    elem: 'page',
                    limit: 3,
                    count: count,
                    jump: async function (obj, first) {
                        console.log('jump');
                        console.log(obj);
                        console.log(first);
                        that.items = await that.getData(obj.curr, obj.limit);
                        console.log('that.items');
                        console.log(that.items);
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
            return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDay() + '  ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        }
    }
});
