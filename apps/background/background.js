/**
 * background.js
 *
 * @date 2025-06-16
 */
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
	console.log("chrome.runtime.onMessage");
	console.log(req);
	if (req.type == 'data') {
		// 添加数据类 消息
		// _insertData(req.data.url, req.data.title, req.data.author);
		chrome.tabs.create({
			url: req.data.url,
			active: true  // 是否激活新标签页（默认true）
		});
	}
});
