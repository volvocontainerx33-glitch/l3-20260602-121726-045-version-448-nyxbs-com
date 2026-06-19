(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slider = qs('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = qsa('[data-hero-slide]', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    var prev = qs('[data-hero-prev]', slider);
    var next = qs('[data-hero-next]', slider);
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var panel = qs('[data-filter-panel]');
    if (!panel) {
      return;
    }
    var cards = qsa('[data-card]');
    var input = qs('[data-filter-q]', panel);
    var year = qs('[data-filter-year]', panel);
    var type = qs('[data-filter-type]', panel);
    var sort = qs('[data-filter-sort]', panel);
    var count = qs('[data-result-count]');

    function match(card) {
      var q = input ? input.value.trim().toLowerCase() : '';
      var haystack = [card.dataset.title, card.dataset.region, card.dataset.genre, card.dataset.type].join(' ').toLowerCase();
      if (q && haystack.indexOf(q) === -1) {
        return false;
      }
      if (year && year.value && card.dataset.year !== year.value) {
        return false;
      }
      if (type && type.value && card.dataset.type !== type.value) {
        return false;
      }
      return true;
    }

    function sortCards() {
      if (!sort) {
        return;
      }
      var grid = qs('[data-card-grid]');
      if (!grid) {
        return;
      }
      var sorted = cards.slice().sort(function (a, b) {
        if (sort.value === 'hot') {
          return Number(b.dataset.hot || 0) - Number(a.dataset.hot || 0);
        }
        if (sort.value === 'title') {
          return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
        }
        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    function apply() {
      sortCards();
      var visible = 0;
      cards.forEach(function (card) {
        var ok = match(card);
        card.classList.toggle('hidden-by-filter', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = visible + ' 部影片';
      }
    }

    [input, year, type, sort].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });

    var params = new URLSearchParams(window.location.search);
    if (input && params.get('q')) {
      input.value = params.get('q');
    }
    apply();
  }

  function initPlayer() {
    var box = qs('[data-player]');
    if (!box) {
      return;
    }
    var video = qs('video', box);
    var button = qs('[data-play-button]', box);
    if (!video || !button) {
      return;
    }
    var loaded = false;

    function loadAndPlay() {
      if (!loaded) {
        var m3u8 = box.getAttribute('data-m3u8');
        var mp4 = box.getAttribute('data-mp4');
        var poster = box.getAttribute('data-poster');
        if (poster) {
          video.poster = poster;
        }
        if (m3u8 && video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = m3u8;
        } else if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(m3u8 || mp4);
          hls.attachMedia(video);
        } else {
          video.src = mp4 || m3u8;
        }
        loaded = true;
      }
      box.classList.add('is-playing');
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }

    button.addEventListener('click', loadAndPlay);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
