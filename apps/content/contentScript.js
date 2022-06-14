(function () {
    $("#TopstoryContent").on('click', 'div.is-collapsed div.RichContent-inner', function () {
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

    $(".SearchBar-askButton").after('<button type="button" class="Button SearchBar-askButton Button--primary Button--red dq-history">History</button>');

    $(".AppHeader").on('click', '.dq-history', function () {
        chrome.runtime.sendMessage({
            type: 'open',
            data: {}
        }, res => {
        });
    });
})();
