(function () {
  var video = document.getElementById('movieVideo');
  var playButton = document.getElementById('playButton');
  var hasLoaded = false;
  var hlsInstance = null;

  function loadVideo() {
    if (!video || hasLoaded || !window.videoUrl) {
      return;
    }

    hasLoaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = window.videoUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(window.videoUrl);
      hlsInstance.attachMedia(video);
    }
  }

  function playMovie() {
    if (!video) {
      return;
    }

    loadVideo();

    if (playButton) {
      playButton.classList.add('is-hidden');
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (playButton) {
          playButton.classList.remove('is-hidden');
        }
      });
    }
  }

  if (playButton) {
    playButton.addEventListener('click', playMovie);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        playMovie();
      }
    });

    video.addEventListener('play', function () {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    });

    video.addEventListener('ended', function () {
      if (hlsInstance) {
        hlsInstance.stopLoad();
      }
    });
  }
})();
