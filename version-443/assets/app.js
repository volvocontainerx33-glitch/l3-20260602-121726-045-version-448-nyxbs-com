(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    function resetTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      startTimer();
    }

    if (slides.length > 1) {
      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          showSlide(Number(dot.getAttribute('data-hero-dot')));
          resetTimer();
        });
      });

      if (prev) {
        prev.addEventListener('click', function () {
          showSlide(current - 1);
          resetTimer();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          showSlide(current + 1);
          resetTimer();
        });
      }

      startTimer();
    }
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-search]'));

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      var scope = input.closest('main') || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();

        card.classList.toggle('card-hidden', keyword.length > 0 && text.indexOf(keyword) === -1);
      });
    });
  });

  var filterGroup = document.querySelector('[data-filter-group]');

  if (filterGroup) {
    var buttons = Array.prototype.slice.call(filterGroup.querySelectorAll('[data-filter]'));
    var scope = filterGroup.closest('main') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

    if (buttons.length) {
      buttons[0].classList.add('is-active');
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-filter');

        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });

        cards.forEach(function (card) {
          var cardType = card.querySelector('.poster-tag');
          var matches = value === '全部' || (cardType && cardType.textContent.trim() === value);
          card.classList.toggle('card-hidden', !matches);
        });
      });
    });
  }
})();
