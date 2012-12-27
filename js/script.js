$(function () {
    var socialIcons = $('#socialicons');
    socialIcons.find('img').hover(
        function () {
            $(this).attr('src', $(this).attr('src').replace('_c.png', '.png'));
        },
        function () {
            $(this).attr('src', $(this).attr('src').replace('.png', '_c.png'));
        });
    socialIcons.find('a').each(
        function () {
            var button = $(this).find('img').attr('alt');
            $(this).attr('target', '_blank');
            switch (button) {
                case 'facebook':
                    $(this).attr('title', 'Like us on Facebook').
                        attr('href', 'http://www.facebook.com/pages/Flickr-Downloadr/298505936913846?sk=info');
                    break;
                case 'flickr':
                    $(this).attr('title', 'Follow us on flickr').
                        attr('href', 'http://www.flickr.com/photos/_floydpink_');
                    break;
                case 'gmail':
                    $(this).attr('title', 'Send us a gmail').
                        attr('target', '_self').
                        attr('href', 'mailto:flickr.downloadr@gmail.com');
                    break;
                case 'google+':
                    $(this).attr('title', 'Follow us on Google+').
                        attr('href', 'https://plus.google.com/u/0/112082983921398252462/about');
                    break;
                case 'pinterest':
                    $(this).attr('title', 'Follow us on Pinterest').
                        attr('href', 'http://pinterest.com/flickrdownloadr/');
                    break;
                case 'twitter':
                    $(this).attr('title', 'Follow us on Twitter').
                        attr('href', 'https://twitter.com/FlickrDownloadr');
                    break;
                case 'youtube':
                    $(this).attr('title', 'Follow us on YouTube').
                        attr('href', 'http://www.youtube.com/user/flickrdownloadr');
                    break;
            }
        });

    $.get('build.number',
        function (data) {
            $('#fd-fd-version-text').text(data);
            $('#fd-fd-version').fadeIn();
        });
});