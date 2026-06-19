(function() {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-main-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function() {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function() {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(index + 1);
        restart();
      });
    }

    start();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterList = document.querySelector('[data-filter-list]');
  if (filterInput && filterList) {
    var items = Array.prototype.slice.call(filterList.children);

    function runFilter(value) {
      var q = String(value || '').trim().toLowerCase();
      items.forEach(function(item) {
        var haystack = [
          item.getAttribute('data-title'),
          item.getAttribute('data-year'),
          item.getAttribute('data-genre'),
          item.getAttribute('data-tags'),
          item.getAttribute('data-region')
        ].join(' ').toLowerCase();
        item.classList.toggle('is-filter-hidden', q && haystack.indexOf(q) === -1);
      });
    }

    filterInput.addEventListener('input', function() {
      runFilter(filterInput.value);
    });

    document.querySelectorAll('[data-filter-key]').forEach(function(button) {
      button.addEventListener('click', function() {
        filterInput.value = button.getAttribute('data-filter-key') || '';
        runFilter(filterInput.value);
        filterInput.focus();
      });
    });
  }
}());
