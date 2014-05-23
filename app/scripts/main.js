'use strict';
/* jshint unused: false */
var fdScripts = (function () {
  return {
    store           : null,
    isStoreReady    : false,
    eTags           : {},
    setupStore      : function () {
      fdScripts.store = new IDBStore({
        dbVersion     : 1,
        storeName     : 'flickr-downloadr-idb',
        keyPath       : 'eTagType',
        autoIncrement : true,
        onStoreReady  : function () {
          fdScripts.isStoreReady = true;
        }
      });
    },
    saveData        : function (type, data) {
      if (fdScripts.isStoreReady) {
        var dataToWrite = {
          eTagType : type,
          data     : data
        };
        fdScripts.store.put(dataToWrite, function () {
        });
      }
    },
    fetchData       : function (type, callback) {
      if (fdScripts.isStoreReady) {
        fdScripts.store.get(type, function (result) {
          callback(result.data);
        });
      }
    },
    getAndSaveETag  : function (type, xhr) {
      var updatedETag = xhr.getResponseHeader('ETag');
      fdScripts.eTags[type] = updatedETag;
      $.cookie('ETag-' + type, updatedETag);
    },
    fetchAndSetETag : function (type) {
      return function (xhr) {
        var currentETag = $.cookie('ETag-' + type);
        if (currentETag && fdScripts.isStoreReady) {  // if store is not ready, don't set the If-None-Match header
          fdScripts.eTags[type] = currentETag;
          xhr.setRequestHeader('If-None-Match', currentETag);
        }
      };
    },
    getJSON         : function (url, callback, type) {
      $.ajax({
        url        : url,
        type       : 'GET',
        dataType   : 'json',
        success    : function (data, textStatus, xhr) {
          if (xhr.status === 200) { // new or updated response
            fdScripts.getAndSaveETag(type, xhr);
            fdScripts.saveData(type, data);
          } else if (xhr.status === 304 && !data) { // no updated data
            fdScripts.fetchData(type, callback);  // get data from local db and call the callback
          } else {
            throw new Error('Something seriously wrong!');
          }
          callback(data);
        },
        error      : function (err) {
          console.log('Ajax Error: %s', err);
        },
        beforeSend : fdScripts.fetchAndSetETag(type)
      });
    },
    gaTrack         : function (category, action, label, value, nonInteraction) {
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

  Detectizr.detect({detectScreen : false});

  fdScripts.setupStore();

  var currentOsName = Detectizr.os.name,
      downloadOnClick = 'fdScripts.gaTrack("Files", "Download", "flickr downloadr %PLATFORM% (home)");',
      platforms = {
        'windows'   : {
          name          : 'Windows',
          commonName    : 'Windows',
          shortName     : 'win',
          installerPath : 'installer/windows/flickrdownloadr-%VERSION%-windows-installer.exe'
        },
        'mac os'    : {
          name          : 'Mac OS X',
          commonName    : 'Mac OS X',
          shortName     : 'osx',
          installerPath : 'installer/osx/Install%20flickr%20downloadr.app.dmg'
        },
        'linux'     : {
          name          : 'Linux',
          commonName    : 'Linux',
          shortName     : 'linux',
          installerPath : 'installer/linux/flickrdownloadr-%VERSION%-linux-installer.run'
        },
        'linux-x64' : {
          name          : '64-bit Linux',
          commonName    : 'Linux',
          shortName     : 'linux',
          installerPath : 'installer/linux-x64/flickrdownloadr-%VERSION%-linux-x64-installer.run'
        }
      };

  var socialIcons = $('#social-icons'),
      socialHash = {
        'facebook'  : {
          title : 'Like us on Facebook',
          href  : 'https://www.facebook.com/flickrdownloadr'
        },
        'flickr'    : {
          title : 'Follow us on flickr',
          href  : 'http://www.flickr.com/photos/_floydpink_'
        },
        'gmail'     : {
          title : 'Send us an email',
          href  : 'mailto:contact.us@flickrdownloadr.com'
        },
        'google+'   : {
          title : 'Follow us on Google+',
          href  : 'https://plus.google.com/u/0/112082983921398252462/about'
        },
        'pinterest' : {
          title : 'Follow us on Pinterest',
          href  : 'http://pinterest.com/flickrdownloadr/'
        },
        'twitter'   : {
          title : 'Follow us on Twitter',
          href  : 'https://twitter.com/FlickrDownloadr'
        },
        'youtube'   : {
          title : 'Follow us on YouTube',
          href  : 'http://www.youtube.com/user/flickrdownloadr'
        },
        'github'    : {
          title : 'Fork us on GitHub',
          href  : 'https://github.com/flickr-downloadr'
        }
      };
  socialIcons.find('a').each(function () {
    var button = $(this).attr('class');
    $(this).attr('target', '_blank').attr('onclick', 'fdScripts.gaTrack(\'External\', \'Click\', \'Social (' + button + ')\');');
    $(this).attr('title', socialHash[button].title).attr('href', socialHash[button].href);
    if (button === 'gmail') {
      $(this).attr('target', '_self');
    }
  });

  if (currentOsName === 'linux' && Detectizr.os.addressRegisterSize === '64bit') {
    currentOsName = 'linux-x64';
  } else if (currentOsName === 'android' || currentOsName === 'blackberry') {
    currentOsName = 'linux';
  } else if (currentOsName === 'ios') {
    currentOsName = 'mac os';
  }

  $.get('build.number', function (latestVersion) {
    var $fdVersion = $('.fd-version');
    $('.fd-version-text').text(latestVersion);
    $('#fd-version').fadeIn();

    //set the installer links
    var currentPlatform = platforms[currentOsName];
    if (!currentPlatform) {
      currentPlatform = platforms.windows;
    }
    var $fdDownloadButton = $('#fd-download-button');
    $fdDownloadButton.attr('onClick', downloadOnClick.replace('%PLATFORM%', currentPlatform.name));
    $fdDownloadButton.attr('href', currentPlatform.installerPath.replace('%VERSION%', latestVersion));
    $('#fd-download-platform-name').text(currentPlatform.name);
    $('#fd-installer').fadeIn();

    var $fdHiddenSlides = $('#fd-hidden-slides');
    var $fdScreenshotsCarousel = $('.fd-screenshots-carousel');
    var $fdScreenshotDialogHeader = $('#fd-screenshot-header-platform');
    $fdScreenshotDialogHeader.find('span').text(currentPlatform.commonName);
    $fdScreenshotDialogHeader.find('a').on('click', function () {
      $fdScreenshotsCarousel.find('.carousel-inner').append($fdHiddenSlides.find('.item').detach());
      $fdScreenshotsCarousel.find('.carousel-inner').find('.item').each(function () {
        var platformName;
        var item = $(this);
        if (item.hasClass('win')) {
          platformName = ' (Windows)';
        } else if (item.hasClass('osx')) {
          platformName = ' (Mac OS X)';
        } else if (item.hasClass('linux')) {
          platformName = ' (Linux)';
        }
        item.find('h4').text(item.find('h4').text() + platformName);
      });
      $fdScreenshotDialogHeader.fadeOut();
      return false;
    });

    // set the screenshots for current platform
    if (currentPlatform.shortName !== 'win') {
      $fdHiddenSlides.append($fdScreenshotsCarousel.find('.win.item').detach());
      $fdHiddenSlides.find('.item').removeClass('active');
      $fdScreenshotsCarousel.find('.carousel-inner').append($fdHiddenSlides.find('.' + currentPlatform.shortName + '.item').detach());
      $fdScreenshotsCarousel.find('.item').first().addClass('active');
    }

    // get the commit sha for this tag
    fdScripts.getJSON('https://api.github.com/repos/flickr-downloadr/flickr-downloadr-gtk/git/refs/tags/v' + latestVersion, function (tagref) {
      fdScripts.getJSON('https://api.github.com/repos/flickr-downloadr/flickr-downloadr-gtk/git/tags/' + tagref.object.sha, function (tag) {
        var dateAbbr = $('<abbr></abbr>').attr('title', tag.tagger.date).text(' (' + (new Date(tag.tagger.date)).toLocaleDateString() + ')').addClass('timeago');
        $fdVersion.append($('<span></span>').addClass('fd-released').append($('<span></span>').text(' - ')).append(dateAbbr));
        $('abbr.timeago').timeago();
      }, 'tag');
    }, 'tagRef');
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
    fdScripts.getJSON('https://api.github.com/repos/flickr-downloadr/flickr-downloadr-gtk/commits',
        function (data) {
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
              commits = { commitsarray : data },
              output = Handlebars.compile(commitsView)(commits);
          $('#commitsContainer').empty().append(output);
          $('abbr.timeago').timeago();
        }, 'commits');
  });

  $('#fd-slideshow-dialog').find('img').wrap(function () {
    return '<a href="' + $(this).attr('src') + '" target="_blank" title="Click to see actual size" />';
  });
});
