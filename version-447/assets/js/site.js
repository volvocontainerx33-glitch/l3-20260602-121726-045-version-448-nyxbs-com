(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function getSearchQuery() {
        return new URLSearchParams(window.location.search).get("q") || "";
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function initSearchForms() {
        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    input && input.focus();
                }
            });
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (slides.length <= 1) {
            return;
        }

        prev && prev.addEventListener("click", function () {
            show(index - 1);
            start();
        });
        next && next.addEventListener("click", function () {
            show(index + 1);
            start();
        });
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function initLocalFilters() {
        var container = document.querySelector("[data-filter-container]");
        if (!container) {
            return;
        }
        var cards = Array.prototype.slice.call(container.querySelectorAll("[data-card]"));
        var search = document.querySelector("[data-filter-search]");
        var region = document.querySelector("[data-filter-region]");
        var year = document.querySelector("[data-filter-year]");

        function run() {
            var keyword = search ? search.value.trim().toLowerCase() : "";
            var regionValue = region ? region.value : "";
            var yearValue = year ? year.value : "";
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.textContent
                ].join(" ").toLowerCase();
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesRegion = !regionValue || card.getAttribute("data-region") === regionValue;
                var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
                card.hidden = !(matchesKeyword && matchesRegion && matchesYear);
            });
        }

        [search, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", run);
                control.addEventListener("change", run);
            }
        });
    }

    function renderSearchCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return [
            "<article class=\"movie-card\">",
            "<a class=\"poster\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"poster-gradient\"></span>",
            "<span class=\"play-chip\">立即观看</span>",
            "</a>",
            "<div class=\"movie-card-body\">",
            "<div class=\"movie-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "年</span></div>",
            "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
            "<p>" + escapeHtml(movie.oneLine) + "</p>",
            "<div class=\"tag-row\">" + tags + "</div>",
            "</div>",
            "</article>"
        ].join("");
    }

    function initSearchPage() {
        var results = document.getElementById("search-results");
        if (!results || !window.MOVIES) {
            return;
        }
        var query = getSearchQuery().trim();
        var title = document.getElementById("search-title");
        var count = document.getElementById("search-count");
        var input = document.querySelector(".search-page-form input[name='q']");
        if (input) {
            input.value = query;
        }
        if (!query) {
            return;
        }
        var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
        var matched = window.MOVIES.filter(function (movie) {
            var haystack = [
                movie.title,
                movie.region,
                movie.year,
                movie.genre,
                movie.category,
                movie.oneLine,
                (movie.tags || []).join(" ")
            ].join(" ").toLowerCase();
            return terms.every(function (term) {
                return haystack.indexOf(term) !== -1;
            });
        });
        if (title) {
            title.textContent = "搜索：“" + query + "”";
        }
        if (count) {
            count.textContent = matched.length ? "找到 " + matched.length + " 部相关影片" : "没有找到相关影片";
        }
        results.innerHTML = matched.slice(0, 240).map(renderSearchCard).join("");
    }

    window.setupHlsPlayer = function (source) {
        var video = document.querySelector("[data-video]");
        var overlay = document.querySelector("[data-play-overlay]");
        if (!video || !source) {
            return;
        }
        var attached = false;
        var hls = null;

        function attach() {
            if (attached) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls();
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            video.controls = true;
            attached = true;
        }

        function play() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("ended", function () {
            if (overlay) {
                overlay.classList.remove("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        initMenu();
        initSearchForms();
        initHero();
        initLocalFilters();
        initSearchPage();
    });
})();
