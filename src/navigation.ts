/**
 * Client-side navigation script embedded verbatim into every generated deck.
 * Kept dependency-free so the output HTML file never needs a network request.
 */
export const navigationScript = `
(function () {
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var counter = document.querySelector('.slide-counter');
  var progressBar = document.querySelector('.progress-bar');
  var notesPanel = document.querySelector('.notes-panel');
  var current = 0;
  var revealed = 0;

  function fragmentsOf(slide) {
    return Array.prototype.slice.call(slide.querySelectorAll('.fragment'));
  }

  function updateFragments() {
    fragmentsOf(slides[current]).forEach(function (fragment, i) {
      fragment.classList.toggle('visible', i < revealed);
    });
  }

  function render() {
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    if (counter) {
      counter.textContent = (current + 1) + ' / ' + slides.length;
    }
    if (progressBar) {
      var pct = slides.length > 1 ? (current / (slides.length - 1)) * 100 : 100;
      progressBar.style.width = pct + '%';
    }
    if (notesPanel) {
      var notes = slides[current].getAttribute('data-notes') || '';
      notesPanel.textContent = notes;
    }
    updateFragments();
  }

  function advance() {
    var fragments = fragmentsOf(slides[current]);
    if (revealed < fragments.length) {
      revealed += 1;
      updateFragments();
      return;
    }
    if (current < slides.length - 1) {
      current += 1;
      revealed = 0;
      render();
    }
  }

  function retreat() {
    if (revealed > 0) {
      revealed -= 1;
      updateFragments();
      return;
    }
    if (current > 0) {
      current -= 1;
      revealed = fragmentsOf(slides[current]).length;
      render();
    }
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowRight' || event.key === ' ') {
      advance();
    } else if (event.key === 'ArrowLeft') {
      retreat();
    } else if (event.key.toLowerCase() === 'n' && notesPanel) {
      notesPanel.classList.toggle('visible');
    } else if (event.key.toLowerCase() === 'f') {
      toggleFullscreen();
    }
  });

  document.addEventListener('click', function (event) {
    if (notesPanel && notesPanel.contains(event.target)) {
      return;
    }
    advance();
  });

  render();
})();
`;
