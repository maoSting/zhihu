/**
 * background.js
 *
 * @date
 */
var BgPageInstance = (function () {
    // db instance
    var db;

    let initMessage = function () {
        chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
            if (req.type == 'data') {
                // 添加数据类 消息
                _insertData(req.data.url, req.data.title, req.data.author);
            } else if (req.type == 'open') {
                // 打开窗口类 消息
                _openPage(1);
            }
        });
    }

    // 初始化 数据库
    let instanceDb = function () {
        let request = window.indexedDB.open('zhihu', 1);


        request.onerror = function (event) {
            console.log("zhihu helper opening DB.");
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
                console.log("zhihu helper logs ObjectStore Created.");
            }
        }

        request.onsuccess = function (event) {
            db = event.target.result;
            db.onerror = function (event) {
                console.log("zhihu helper FAILED TO OPEN DB.")
            }
        }

    }

    // 插入数据
    let _insertData = function (url, title, author) {
        let transaction = db.transaction("logs", "readwrite");
        let objectStore = transaction.objectStore('logs');
        objectStore.add({
            url: url,
            title: title,
            author: author,
            date: new Date().getTime()
        });
    }

    /**
     * 获取页数
     *
     * @param page
     * @param pageSize
     * @param resolve
     * @returns {Promise<*[]>}
     * @private
     */
    let _getData = async function (page = 1, pageSize, resolve) {
        let size = pageSize || 15;
        let data = [];

        // 获取行数
        let countPromise = new Promise((resolve, reject) => {
            _getDataCount(resolve, reject)
        });
        let count = 0;
        await Promise.all([countPromise]).then(function (result){
            count = result[0]
        })

        let start = count - ((page - 1) * size);
        let end = count - page * size;

        let keyRange = IDBKeyRange.bound(end, start, true, false);
        let objectStore = db.transaction('logs', 'readonly').objectStore('logs');
        objectStore.openCursor(keyRange, 'prev').onsuccess = function (event) {
            let cursor = event.target.result;
            if (cursor) {
                // cursor.value就是数据对象
                data.push(cursor.value);
                cursor.continue();
            } else {
                // 如果全部遍历完毕...
                resolve(data);
            }
        }
        return data;
    }

    // 获取总页数
    let _getDataCount = async function (resolve, reject) {
        let count = 0;
        let objectStore = db.transaction('logs', 'readonly').objectStore('logs');
        let countRequest = objectStore.count();
        countRequest.onsuccess = function () {
            count = countRequest.result;
            resolve(count);
        }
        countRequest.onerror = function () {
            reject(count)
        }
        return count;
    }

    /**
     * 打开文件
     *
     * @private
     */
    let _openPage = function (type) {
        type = type || 1;
        let extensionId = chrome.runtime.id;
        let donateUrl = 'apps/donate/donate.html';
        let mainUrl = 'apps/main/main.html';
        let url = '';
        if (type == 1) {
            url = mainUrl;
        } else {
            url = donateUrl;
        }

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
                    active: true,
                });
            } else {
                chrome.tabs.update(tabId, {highlighted: true});
            }
        });
    }

    let _getMessage = function (words, defaultMsg) {
        defaultMsg = defaultMsg || [];
        return chrome.i18n.getMessage(words, defaultMsg);
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
        getRow: _getData,
        openPage: _openPage,
        getDataCount: _getDataCount,
        getMessage: _getMessage
    };
})();

//初始化
BgPageInstance.init();