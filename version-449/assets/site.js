(function () {
  var nav = document.getElementById('mainNav');
  var menuButton = document.querySelector('[data-menu-toggle]');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(nextIndex) {
      index = nextIndex % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  var globalInput = document.getElementById('globalSearch');
  var globalResults = document.getElementById('globalSearchResults');

  if (globalInput && globalResults && Array.isArray(window.SEARCH_INDEX)) {
    globalInput.addEventListener('input', function () {
      var keyword = normalize(globalInput.value);

      if (!keyword) {
        globalResults.classList.remove('is-open');
        globalResults.innerHTML = '';
        return;
      }

      var matches = window.SEARCH_INDEX.filter(function (item) {
        return normalize(item.title + ' ' + item.oneLine + ' ' + item.genre + ' ' + item.tags).indexOf(keyword) !== -1;
      }).slice(0, 8);

      if (matches.length === 0) {
        globalResults.innerHTML = '<a href="javascript:void(0)"><strong>没有找到匹配影片</strong><small>可以换一个关键词继续搜索</small></a>';
        globalResults.classList.add('is-open');
        return;
      }

      var pathPrefix = getPathPrefix();

      globalResults.innerHTML = matches.map(function (item) {
        return '<a href="' + pathPrefix + item.url + '"><strong>' + escapeHtml(item.title) + '</strong><small>' + escapeHtml(item.oneLine) + '</small></a>';
      }).join('');
      globalResults.classList.add('is-open');
    });

    document.addEventListener('click', function (event) {
      if (!globalInput.contains(event.target) && !globalResults.contains(event.target)) {
        globalResults.classList.remove('is-open');
      }
    });
  }

  function getPathPrefix() {
    var path = window.location.pathname || '';
    return path.indexOf('/movies/') !== -1 || path.indexOf('/categories/') !== -1 ? '../' : '';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  var localFilter = document.querySelector('[data-local-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  if (localFilter && cards.length > 0) {
    localFilter.addEventListener('input', function () {
      var keyword = normalize(localFilter.value);

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));

        card.style.display = haystack.indexOf(keyword) === -1 ? 'none' : '';
      });
    });
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var source = player.getAttribute('data-video-src');
    var hlsInstance = null;

    function startPlayback() {
      if (!video || !source) {
        return;
      }

      if (button) {
        button.classList.add('is-hidden');
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }

      video.src = source;
      video.play().catch(function () {});
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
