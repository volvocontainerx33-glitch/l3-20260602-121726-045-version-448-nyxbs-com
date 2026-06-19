(function() {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');

        if (toggle && panel) {
            toggle.addEventListener('click', function() {
                panel.classList.toggle('is-open');
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

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function(slide, i) {
                    slide.classList.toggle('is-active', i === current);
                });
                dots.forEach(function(dot, i) {
                    dot.classList.toggle('is-active', i === current);
                });
            }

            function startTimer() {
                timer = setInterval(function() {
                    show(current + 1);
                }, 5200);
            }

            function resetTimer() {
                if (timer) {
                    clearInterval(timer);
                }
                startTimer();
            }

            if (prev) {
                prev.addEventListener('click', function() {
                    show(current - 1);
                    resetTimer();
                });
            }

            if (next) {
                next.addEventListener('click', function() {
                    show(current + 1);
                    resetTimer();
                });
            }

            dots.forEach(function(dot) {
                dot.addEventListener('click', function() {
                    show(Number(dot.getAttribute('data-hero-dot')));
                    resetTimer();
                });
            });

            show(0);
            startTimer();
        }

        var scope = document.querySelector('[data-filter-scope]');
        if (scope) {
            var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter]'));
            var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

            buttons.forEach(function(button) {
                button.addEventListener('click', function() {
                    var value = button.getAttribute('data-filter');
                    buttons.forEach(function(item) {
                        item.classList.toggle('is-active', item === button);
                    });
                    cards.forEach(function(card) {
                        var visible = true;
                        if (value.indexOf('year:') === 0) {
                            visible = card.getAttribute('data-year') === value.replace('year:', '');
                        }
                        if (value.indexOf('type:') === 0) {
                            visible = card.getAttribute('data-type') === value.replace('type:', '');
                        }
                        if (value === 'all') {
                            visible = true;
                        }
                        card.classList.toggle('is-hidden', !visible);
                    });
                });
            });
        }

        if (window.SEARCH_DATA) {
            var input = document.getElementById('searchInput');
            var button = document.getElementById('searchButton');
            var results = document.getElementById('searchResults');
            var count = document.getElementById('searchCount');
            var region = document.getElementById('regionFilter');
            var type = document.getElementById('typeFilter');
            var year = document.getElementById('yearFilter');
            var params = new URLSearchParams(window.location.search);

            if (input) {
                input.value = params.get('q') || '';
            }

            function card(item) {
                var tags = item.tags.slice(0, 3).map(function(tag) {
                    return '<span>' + escapeHtml(tag) + '</span>';
                }).join('');
                return '<article class="movie-card">' +
                    '<a class="poster" href="./' + escapeHtml(item.url) + '">' +
                    '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                    '<span class="poster-badge">' + escapeHtml(item.year) + '</span>' +
                    '</a>' +
                    '<div class="card-body">' +
                    '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
                    '<h3><a href="./' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>' +
                    '<p>' + escapeHtml(item.oneLine) + '</p>' +
                    '<div class="tag-row">' + tags + '</div>' +
                    '</div>' +
                    '</article>';
            }

            function escapeHtml(value) {
                return String(value).replace(/[&<>"]/g, function(match) {
                    return {
                        '&': '&amp;',
                        '<': '&lt;',
                        '>': '&gt;',
                        '"': '&quot;'
                    }[match];
                });
            }

            function render() {
                var q = (input ? input.value : '').trim().toLowerCase();
                var r = region ? region.value : '';
                var t = type ? type.value : '';
                var y = year ? year.value : '';
                var list = window.SEARCH_DATA.filter(function(item) {
                    var haystack = [item.title, item.region, item.type, item.year, item.genre, item.oneLine, item.tags.join(' ')].join(' ').toLowerCase();
                    if (q && haystack.indexOf(q) === -1) {
                        return false;
                    }
                    if (r && item.region !== r) {
                        return false;
                    }
                    if (t && item.type !== t) {
                        return false;
                    }
                    if (y && String(item.year) !== String(y)) {
                        return false;
                    }
                    return true;
                }).slice(0, 120);

                if (count) {
                    count.textContent = '当前显示 ' + list.length + ' 条结果，最多展示前 120 条。';
                }

                if (results) {
                    results.innerHTML = list.map(card).join('');
                }
            }

            [input, region, type, year].forEach(function(el) {
                if (el) {
                    el.addEventListener('input', render);
                    el.addEventListener('change', render);
                }
            });

            if (button) {
                button.addEventListener('click', render);
            }

            render();
        }
    });
}());
