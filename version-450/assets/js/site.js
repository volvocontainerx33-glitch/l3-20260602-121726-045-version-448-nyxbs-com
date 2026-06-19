(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileNav() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-main-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupPageFilter() {
    var input = document.querySelector('[data-filter-input]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var list = document.querySelector('[data-filter-list]');
    if (!list || (!input && !yearSelect)) {
      return;
    }
    var cards = Array.prototype.slice.call(list.children);

    function getText(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.textContent
      ].join(' ').toLowerCase();
    }

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      cards.forEach(function (card) {
        var text = getText(card);
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !year || String(card.getAttribute('data-year')).indexOf(year) !== -1;
        card.classList.toggle('is-filter-hidden', !(matchKeyword && matchYear));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }
  }

  function setupSearchPage() {
    var form = document.querySelector('[data-search-form]');
    var box = document.querySelector('[data-search-box]');
    var results = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');
    if (!form || !box || !results || !summary || !window.MOVIE_INDEX) {
      return;
    }

    function card(movie) {
      return [
        '<article class="movie-card">',
        '  <a class="poster-frame" href="' + movie.url + '" aria-label="观看' + escapeHtml(movie.title) + '">',
        '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="poster-mask"></span>',
        '    <span class="play-dot">▶</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <div class="movie-meta-line">',
        '      <span>' + escapeHtml(movie.year) + '</span>',
        '      <span>' + escapeHtml(movie.region) + '</span>',
        '      <span>' + escapeHtml(movie.type) + '</span>',
        '    </div>',
        '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="tag-row"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function render(query) {
      var q = String(query || '').trim().toLowerCase();
      if (!q) {
        summary.textContent = '请输入关键词开始搜索。';
        results.innerHTML = '';
        return;
      }
      var matched = window.MOVIE_INDEX.filter(function (movie) {
        return movie.search.indexOf(q) !== -1;
      }).slice(0, 120);
      summary.textContent = '找到 ' + matched.length + ' 条相关结果；最多展示前 120 条。';
      results.innerHTML = matched.map(card).join('');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render(box.value);
      var url = new URL(window.location.href);
      url.searchParams.set('q', box.value);
      window.history.replaceState(null, '', url.toString());
    });

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (initial) {
      box.value = initial;
      render(initial);
    }
  }

  function setupHlsPlayer() {
    var video = document.querySelector('[data-hls-video]');
    var button = document.querySelector('[data-player-button]');
    if (!video || !button) {
      return;
    }
    var started = false;

    function start() {
      if (started) {
        video.play();
        return;
      }
      started = true;
      button.classList.add('is-hidden');
      var src = video.getAttribute('data-src');
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = src;
        video.play().catch(function () {});
      }
    }

    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });
  }

  ready(function () {
    setupMobileNav();
    setupHero();
    setupPageFilter();
    setupSearchPage();
    setupHlsPlayer();
  });
})();
