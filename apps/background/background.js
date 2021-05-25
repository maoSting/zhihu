console.log('zhihu background');

var BgPageInstance = (function () {

    var db;

    let initMessage = function () {
        chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
            sendResponse('我收到了你的来信')
            console.log('接收了来自 content.js的消息', req)
            if (req.type == 'data') {
                // 添加数据类 消息
                _insertData(req.data.url, req.data.title, req.data.author);
            } else if (req.type == 'open') {
                // 打开窗口类 消息
                _openPage();
            }
        });
    }

    // 初始化 数据库
    let instanceDb = function () {
        let request = window.indexedDB.open('zhihu', 1);


        request.onerror = function (event) {
            console.log("Problem opening DB.");
        }

        request.onupgradeneeded = function (event) {
            db = event.target.result;

            let objectStore = db.createObjectStore('logs', {
                keyPath: 'id',
                autoIncrement: true
            });
            objectStore.createIndex('url', 'url', {
                unique: true
            });
            objectStore.createIndex('title', 'title');
            objectStore.createIndex('author', 'author');
            objectStore.createIndex('date', 'date');

            objectStore.transaction.oncomplete = function (event) {
                console.log("logs ObjectStore Created.");
            }
        }

        request.onsuccess = function (event) {
            db = event.target.result;
            console.log("DB OPENED.");
            db.onerror = function (event) {
                console.log("FAILED TO OPEN DB.")
            }
        }

    }

    // 插入数据
    let _insertData = function (url, title, author) {
        console.log('db _insertData');
        console.log(db);
        let transaction = db.transaction("logs", "readwrite");
        console.log(transaction);
        let objectStore = transaction.objectStore('logs');
        objectStore.add({
            url: url,
            title: title,
            author: author,
            date: new Date().getTime()
        });
    }

    let _getData = function (page = 1, pageSize) {
        let pageSize = pageSize || 15;
        let data = [];

        let objectStore = db.transaction('logs', 'readonly').objectStore('logs');
        let count = objectStore.count();

        let keyRange = IDBKeyRange.bound(1, 10);
        objectStore.openCursor(keyRange).onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                // cursor.value就是数据对象
                // 游标没有遍历完，继续
                data.push(cursor.value);
                cursor.continue();
            } else {
                // 如果全部遍历完毕...
            }
        }
        return data;
    }

    // 获取总页数
    let _getDataCount = function (callback) {
        console.log('_getDataCount');

        let count = 0;

        let objectStore = db.transaction('logs', 'readonly').objectStore('logs');
        let countRequest = objectStore.count();
        countRequest.onsuccess = function() {
            count = countRequest.result;
            console.log(countRequest.result);
            callback(count);
        }
        console.log('count');
        console.log(count);
        return count;
    }

    /**
     * 打开文件
     *
     * @private
     */
    let _openPage = function () {
        let extensionId = chrome.runtime.id;
        let url = 'apps/main/main.html';

        chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, function (tabs) {
            let isOpened = false;
            let tabId;

            // 允许在新窗口打开
            // chrome-extension://imdbeoobmakeedfichpnmmogeblepnci/apps/main/main.html
            // chrome.extension.getBackgroundPage().console.log('foo');
            let reg = "chrome-extension://" + extensionId + "/" + url;
            for (let i = 0, len = tabs.length; i < len; i++) {
                if (tabs[i].url == reg) {
                    isOpened = true;
                    tabId = tabs[i].id;
                    break;
                }
            }
            if (!isOpened) {
                chrome.tabs.create({
                    url: url,
                    active: true
                });
            } else {
                chrome.tabs.update(tabId, {highlighted: true});
            }
        });
    }

    /**
     * 初始化
     */
    let _init = function () {
        instanceDb();
        initMessage();
    };

    return {
        init: _init,
        insertData: _insertData,
        getData: _getData,
        getDataCount: _getDataCount
    };
})();

//初始化
BgPageInstance.init();