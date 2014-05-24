'use strict';
/* jshint unused: false */
var fdScripts = (function () {
  return {
    stripString    : function (input, textToStrip) {
      var textToStripStart = input.indexOf(textToStrip);
      return textToStripStart !== -1 ? input.slice(0, textToStripStart) + input.substr(textToStripStart + textToStrip.length) : input;
    },
    truncateString : function (input, truncateAt) {
      var truncationAt = input.indexOf(truncateAt);
      return truncationAt !== -1 ? input.slice(0, truncationAt) : input;
    },
    getJSON        : function (url, callback) {
      $.ajax({
        url      : url,
        type     : 'GET',
        dataType : 'json',
        success  : callback,
        error    : function (err) {
          console.log('Ajax Error: %s', err);
        }
      });
    },
    gaTrack        : function (category, action, label, value, nonInteraction) {
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

$(function () {

  Detectizr.detect({detectScreen : false});

  Handlebars.registerHelper('is_release', function (message, author) {
    return  (message.indexOf('Released ') === 0 && author === 'The CI Bot') ? ' fd-release-commit' : 'fd-commit';
  });

  Handlebars.registerHelper('strip_sign', function (message, length) {
    var returnMessage = fdScripts.truncateString(message, 'Signed-off-by:');
    returnMessage = fdScripts.stripString(returnMessage, '[skip ci]');
    returnMessage = fdScripts.stripString(returnMessage, '[ci skip]');
    returnMessage = fdScripts.stripString(returnMessage, '[deploy]');
    returnMessage = returnMessage.length > length - 1 ? returnMessage.slice(0, length) + '...' : returnMessage;
    return  returnMessage;
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

  var currentOsName = Detectizr.os.name,
      homeInstallOnClick = 'fdScripts.gaTrack("Files", "Download", "flickr downloadr %PLATFORM% (home)");',
      downloadsInstallOnClick = 'fdScripts.gaTrack("Files", "Download", "flickr downloadr %PLATFORM% (downloads)");',
      socialIcons = $('#social-icons'),
      deb = {
        installerPath : '/installer/linux-x64/flickrdownloadr_%VERSION%-0_amd64.deb',
        installerFile : 'flickrdownloadr_%VERSION%-0_amd64.deb'
      },
      rpm = {
        installerPath : '/installer/linux-x64/flickrdownloadr-%VERSION%-0.x86_64.rpm',
        installerFile : 'flickrdownloadr-%VERSION%-0.x86_64.rpm'
      },
      platforms = {
        'windows'   : {
          name          : 'Windows',
          commonName    : 'Windows',
          shortName     : 'win',
          iconName      : 'fa-windows',
          installerPath : '/installer/windows/flickrdownloadr-%VERSION%-windows-installer.exe',
          installerFile : 'flickrdownloadr-%VERSION%-windows-installer.exe'
        },
        'osx'       : {
          name          : 'Mac OS X',
          commonName    : 'Mac OS X',
          shortName     : 'osx',
          iconName      : 'fa-apple',
          installerPath : '/installer/osx/flickrdownloadr-%VERSION%-osx-installer.app.dmg',
          installerFile : 'flickrdownloadr-%VERSION%-osx-installer.app.dmg'
        },
        'linux'     : {
          name          : 'Linux',
          commonName    : 'Linux',
          shortName     : 'linux',
          iconName      : 'fa-linux',
          installerPath : '/installer/linux/flickrdownloadr-%VERSION%-linux-installer.run',
          installerFile : 'flickrdownloadr-%VERSION%-linux-installer.run'
        },
        'linux-x64' : {
          name          : '64-bit Linux',
          commonName    : 'Linux',
          shortName     : 'linux',
          iconName      : 'fa-linux',
          installerPath : '/installer/linux-x64/flickrdownloadr-%VERSION%-linux-x64-installer.run',
          installerFile : 'flickrdownloadr-%VERSION%-linux-x64-installer.run'
        }
      },
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
  // setup the social icons
  socialIcons.find('a').each(function () {
    var button = $(this).attr('class');
    $(this).attr('target', '_blank').attr('onclick', 'fdScripts.gaTrack(\'External\', \'Click\', \'Social (' + button + ')\');');
    $(this).attr('title', socialHash[button].title).attr('href', socialHash[button].href);
    if (button === 'gmail') {
      $(this).attr('target', '_self');
    }
  });
  // detect platform and do the mobile-os mappings
  if (currentOsName === 'linux' && Detectizr.os.addressRegisterSize === '64bit') {
    currentOsName = 'linux-x64';
  } else if (currentOsName === 'android' || currentOsName === 'blackberry') {
    currentOsName = 'linux';
  } else if (currentOsName === 'mac os' || currentOsName === 'ios') {
    currentOsName = 'osx';
  }

  $.get('/build.number', function (latestVersion) {
    var $fdVersion = $('.fd-version');
    $('.fd-version-text').text(latestVersion);
    $('.fd-version-quote').fadeIn();

    //set the installer links
    var currentPlatform = platforms[currentOsName];
    if (!currentPlatform) {
      currentPlatform = platforms.windows;
      currentOsName = 'windows';
    }
    var $fdDownloadButton = $('#fd-download-button');
    $fdDownloadButton.attr('onClick', homeInstallOnClick.replace('%PLATFORM%', currentPlatform.name));
    $fdDownloadButton.attr('href', currentPlatform.installerPath.replace('%VERSION%', latestVersion));
    $('#fd-download-platform-name').text(currentPlatform.name);
    $('#fd-download-platform-icon').addClass(currentPlatform.iconName);
    $('#fd-installer').fadeIn();

    // installer links and filenames on downloads page
    $.each(['windows', 'osx', 'linux', 'linux-x64'], function (id, val) {
      var platform = platforms[val];
      $('#fd-installer-' + val + '-file').text(decodeURIComponent(platform.installerFile.replace('%VERSION%', latestVersion)));
      var $fdInstallerButton = $('#fd-installer-download-' + val + '-button');
      $fdInstallerButton.attr('onClick', downloadsInstallOnClick.replace('%PLATFORM%', platform.name));
      $fdInstallerButton.attr('href', platform.installerPath.replace('%VERSION%', latestVersion));
    });
    // deb
    $('#fd-installer-deb-file').text(deb.installerFile.replace('%VERSION%', latestVersion));
    var $fdDebDownloadLink = $('#fd-installer-deb');
    $fdDebDownloadLink.attr('onClick', downloadsInstallOnClick.replace('%PLATFORM%', 'linux-deb'));
    $fdDebDownloadLink.attr('href', deb.installerPath.replace('%VERSION%', latestVersion));
    // rpm
    $('#fd-installer-rpm-file').text(rpm.installerFile.replace('%VERSION%', latestVersion));
    var $fdRpmDownloadLink = $('#fd-installer-rpm');
    $fdRpmDownloadLink.attr('onClick', downloadsInstallOnClick.replace('%PLATFORM%', 'linux-rpm'));
    $fdRpmDownloadLink.attr('href', rpm.installerPath.replace('%VERSION%', latestVersion));

    // set the current platform as active tab on downloads page
    $('#fd-installer-download-' + currentOsName + '-button').removeClass('btn-warning').addClass('btn-success');
    $('a[href="#fd-installer-' + currentOsName + '"]').tab('show');
    $('#fd-installer-section-column').fadeIn();

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
      });
    });
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
                  '   <tr class=\'{{is_release commit.message commit.author.name}}\'>' +
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
        });
  });

  // add links to full-size images from screenshots
  $('#fd-slideshow-dialog').find('img').wrap(function () {
    return '<a href="' + $(this).attr('src') + '" target="_blank" title="Click to see actual size" />';
  });
});
