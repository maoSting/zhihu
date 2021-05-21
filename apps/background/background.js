console.log('zhihu background');

var BgPageInstance = (function () {

    var db;

    let initMessage = function () {
        chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
            sendResponse('我收到了你的来信')
            console.log('接收了来自 content.js的消息', req)
            _insertData(req.url, req.title, req.author);
        });
    }

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
        console.log(db.close());
        let transaction = db.transaction(["zhihu"]);
        console.log(transaction);
        let objectStore = transaction.objectStore('logs');
        objectStore.add({
            url: url,
            title: title,
            author: author,
            date: new Date().getTime()
        });
    }

    let _getData = function (page = 1) {
        let pageSize = 15;
        let data = [];

        let objectStore = db.transaction('zhihu', 'readonly').objectStore('logs');
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
    };
})();

//初始化
BgPageInstance.init();