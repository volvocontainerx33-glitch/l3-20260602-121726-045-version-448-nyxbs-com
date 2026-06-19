(function () {
    var button = document.querySelector(".play-trigger");
    var video = document.querySelector(".video-player");
    var cover = document.querySelector(".player-cover");

    if (!button || !video) {
        return;
    }

    var streamUrl = button.getAttribute("data-video-url") || "";
    var started = false;

    function loadLibrary(callback) {
        if (window.Hls) {
            callback();
            return;
        }

        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
        script.onload = callback;
        script.onerror = callback;
        document.head.appendChild(script);
    }

    function playVideo() {
        if (!streamUrl) {
            return;
        }

        if (cover) {
            cover.classList.add("is-hidden");
        }

        if (started) {
            video.play().catch(function () {});
            return;
        }

        started = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            video.play().catch(function () {});
            return;
        }

        loadLibrary(function () {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.src = streamUrl;
                video.play().catch(function () {});
            }
        });
    }

    button.addEventListener("click", playVideo);

    if (cover) {
        cover.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        }
    });
})();
