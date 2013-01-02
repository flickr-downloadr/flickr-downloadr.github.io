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
                        attr('href', 'http://www.facebook.com/FlickrDownloadrPage');
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

    $.get('/build.number',
        function (data) {
            $('.fd-version-text').text(data);
            $('.fd-version').fadeIn();
        });

    Handlebars.registerHelper('strip_sign', function (message) {
        var signOffStart = message.indexOf('Signed-off-by:');
        return signOffStart !== -1 ? message.slice(0, signOffStart) : message;
    });

    Handlebars.registerHelper('format_date', function (date) {
        var dateToFormat = (new Date(date));
        return dateToFormat.toLocaleDateString() + ' ' + dateToFormat.toLocaleTimeString();
    });

    Handlebars.registerHelper('fix_github_url', function (url) {
        var returnUrl = url.replace('https://api.github.com/users/', 'https://github.com/');
        returnUrl = returnUrl.replace('https://api.github.com/repos/', 'https://github.com/');
        return returnUrl.replace('/commits/', '/commit/');
    });

    $(document).on('click', '#getCommits', function () {
        $.getJSON('https://api.github.com/repos/flickr-downloadr/flickr-downloadr/commits?callback=?',
            function (response) {
                var commitsView = "<table><thead><th class='fd-commitmessage'>Message</th>" +
                    "<th class='fd-commitname'>Author</th></thead><tbody>{{#commitsarray}}<tr>" +
                    "<td class='fd-commitmessage'><span>{{strip_sign commit.message}}</span>" +
                    "<span><a href='{{fix_github_url url}}' title='{{format_date commit.author.date}}' " +
                    "target='_blank'>&raquo;</a></span></td>" +
                    "<td class='fd-commitname'><a href='{{fix_github_url author.url}}' " +
                    "target='_blank'>{{commit.author.name}}</a></td>" +
                    "</tr>{{/commitsarray}}</tbody></table>";
                var commits = {
                    commitsarray:response.data
                };
                var output = Handlebars.compile(commitsView)(commits);
                $('#commitsContainer').append(output);
            });
    });
});
