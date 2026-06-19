(function() {
  function bindMoviePlayer(videoId, overlayId, source) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var started = false;
    var hls = null;

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function playVideo() {
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function() {});
      }
    }

    function loadVideo() {
      if (!video || !source) {
        return;
      }

      if (started) {
        hideOverlay();
        playVideo();
        return;
      }

      started = true;
      hideOverlay();

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
          playVideo();
        });
        return;
      }

      video.src = source;
      playVideo();
    }

    if (overlay) {
      overlay.addEventListener('click', loadVideo);
    }

    if (video) {
      video.addEventListener('click', function() {
        if (!started) {
          loadVideo();
        }
      });
      video.addEventListener('play', hideOverlay);
    }

    window.addEventListener('beforeunload', function() {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  window.bindMoviePlayer = bindMoviePlayer;
}());
