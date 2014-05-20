'use strict';
/* jshint unused: false */
var fdScripts = (function () {
  return {
    gaTrack : function (category, action, label, value, nonInteraction) {
      if (window.ga) {
        if (nonInteraction !== undefined) {
          window.ga('send', 'event', category, action, label, value, nonInteraction);
        } else if (value !== undefined) {
          window.ga('send', 'event', category, action, label, value);
        } else {
          window.ga('send', 'event', category, action, label);
        }
      }
    }
  };
})();

$.ajaxSetup({
  cache : true
});

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
        $(this).attr('target', '_blank').attr('onclick', 'fdScripts.gaTrack(\'External\', \'Click\', \'Social (' + button + ')\');');
        switch (button) {
          case 'facebook':
            $(this).attr('title', 'Like us on Facebook').
                attr('href', 'https://www.facebook.com/flickr.downloadr');
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
        var $fdVersion = $('.fd-version');
        $('.fd-version-text').text(data);
        $fdVersion.fadeIn();
        // get the commit sha for this tag
        $.getJSON('https://api.github.com/repos/flickr-downloadr/flickr-downloadr/git/refs/tags/v' + data + '?callback=?', function (tagref) {
          $.getJSON('https://api.github.com/repos/flickr-downloadr/flickr-downloadr/git/tags/' + tagref.data.object.sha + '?callback=?', function (tag) {
            var dateAbbr = $('<abbr></abbr>').attr('title', tag.data.tagger.date).text(' (' + (new Date(tag.data.tagger.date)).toLocaleDateString() + ')').addClass('timeago');
            $fdVersion.append($('<span></span>').addClass('fd-released').append($('<span></span>').text(' - ')).append(dateAbbr));
            $('abbr.timeago').timeago();
          });
        });
      });

  Handlebars.registerHelper('strip_sign', function (message, length) {
    var signOffStart = message.indexOf('Signed-off-by:');
    var returnMessage = signOffStart !== -1 ? message.slice(0, signOffStart) : message;
    return returnMessage.length > length - 1 ? returnMessage.slice(0, length) + '...' : returnMessage;
  });

  Handlebars.registerHelper('format_date', function (date) {
    var dateToFormat = (new Date(date));
    return dateToFormat.toLocaleDateString();
  });

  Handlebars.registerHelper('format_date_time', function (date) {
    var dateToFormat = (new Date(date));
    return dateToFormat.toLocaleDateString() + ' ' + dateToFormat.toLocaleTimeString();
  });

  Handlebars.registerHelper('fix_github_url', function (url) {
    if (!url) {
      return url;
    }
    var returnUrl = url.replace('https://api.github.com/users/', 'https://github.com/');
    returnUrl = returnUrl.replace('https://api.github.com/repos/', 'https://github.com/');
    return returnUrl.replace('/commits/', '/commit/');
  });

  $(document).on('click', '#getCommits', function () {
    $('#commitsContainer').empty().append($('<div><span class="muted">Loading...</span></div>'));
    $.getJSON('https://api.github.com/repos/flickr-downloadr/flickr-downloadr/commits?callback=?',
        function (response) {
          var commitsView = '<table>' +
                  ' <thead>' +
                  '   <th class=\'fd-commitmessage\'>Message</th>' +
                  '   <th class=\'fd-commitname\'>Author</th>' +
                  '   <th class=\'fd-commitdate\'>Date</th>' +
                  ' </thead>' +
                  ' <tbody>' +
                  ' {{#commitsarray}}' +
                  '   <tr>' +
                  '     <td class=\'fd-commitmessage\'>' +
                  '       <span>{{strip_sign commit.message 40}}</span>' +
                  '       <span>' +
                  '         <a href=\'{{fix_github_url url}}\' title=\'{{format_date_time commit.author.date}}\' target=\'_blank\'> &raquo;</a>' +
                  '       </span>' +
                  '     </td>' +
                  '     <td class=\'fd-commitname\'>' +
                  '       <a href=\'{{fix_github_url author.url}}\' target=\'_blank\'>{{strip_sign commit.author.name 15}}</a>' +
                  '     </td>' +
                  '     <td class=\'fd-commitdate\'>' +
                  '       <abbr class=\'timeago\' title=\'{{commit.author.date}}\'>{{format_date commit.author.date}}</abbr>' +
                  '     </td>' +
                  '   </tr>' +
                  ' {{/commitsarray}}' +
                  ' </tbody>' +
                  '</table>',
              commits = { commitsarray : response.data },
              output = Handlebars.compile(commitsView)(commits);
          $('#commitsContainer').empty().append(output);
          $('abbr.timeago').timeago();
        });
  });

  $('#fd-slideshow-dialog').find('img').wrap(function () {
    return '<a href="' + $(this).attr('src') + '" target="_blank" title="Click to see actual size" />';
  });
});
