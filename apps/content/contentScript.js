(function () {
    $("#TopstoryContent").on('click', '.ContentItem-more', function () {
        let parent = $(this).closest(".ContentItem");
        let info = JSON.parse(parent.attr('data-zop'));

        let urlNode = parent.children("meta[itemprop='url']");

        let url = urlNode.attr('content');
        let title = info.title;
        let author = info.authorName;

        chrome.runtime.sendMessage({
            type: 'data',
            data: {
                url: url,
                title: title,
                author: author,
            }
        }, res => {
        });
    });

    $(".SearchBar-tool").after('<button type="button" class="Button Button--primary Button--red superDQ-history">History</button>');

    $(".AppHeader").on('click', '.superDQ-history', function () {
        chrome.runtime.sendMessage({
	        type: 'data',
	        data: {
		        url: 'chrome://history',
	        }
        }, res => {
        });
    });
})();
