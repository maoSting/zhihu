console.log('zhihu content');
(function () {
    $("#TopstoryContent").on('click', '.ContentItem-more', function () {
        console.log('click2');
        let parent = $(this).closest(".ContentItem");
        let info = JSON.parse(parent.attr('data-zop'));

        let urlNode = parent.children("meta[itemprop='url']");

        let url = urlNode.attr('content');
        let title = info.title;
        let author = info.authorName;

        console.log(url, title, author);

        chrome.runtime.sendMessage({
            url: url,
            title: title,
            author: author,
        }, res => {
            console.log(res);
        });

    });
})();
