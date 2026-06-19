(function () {
    var menuButton = document.querySelector(".menu-button");
    var mainNav = document.querySelector(".main-nav");

    if (menuButton && mainNav) {
        menuButton.addEventListener("click", function () {
            mainNav.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
    var active = 0;

    function setSlide(index) {
        if (!slides.length) {
            return;
        }

        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === active);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            setSlide(index);
        });
    });

    if (slides.length > 1) {
        setSlide(0);
        window.setInterval(function () {
            setSlide(active + 1);
        }, 5200);
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var filterSelect = document.querySelector("[data-filter-select]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var empty = document.querySelector(".search-empty");

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function applyFilter() {
        if (!cards.length) {
            return;
        }

        var query = normalize(filterInput ? filterInput.value : "");
        var year = filterSelect ? filterSelect.value : "";
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-genre")
            ].join(" "));
            var cardYear = card.getAttribute("data-year") || "";
            var matched = (!query || haystack.indexOf(query) !== -1) && (!year || cardYear === year);
            card.style.display = matched ? "" : "none";
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.style.display = visible ? "none" : "block";
        }
    }

    if (filterInput) {
        var url = new URL(window.location.href);
        var q = url.searchParams.get("q");
        if (q) {
            filterInput.value = q;
        }
        filterInput.addEventListener("input", applyFilter);
    }

    if (filterSelect) {
        filterSelect.addEventListener("change", applyFilter);
    }

    applyFilter();
})();
