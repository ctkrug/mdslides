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
  }

  function go(delta) {
    current = Math.min(Math.max(current + delta, 0), slides.length - 1);
    render();
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowRight' || event.key === ' ') {
      go(1);
    } else if (event.key === 'ArrowLeft') {
      go(-1);
    } else if (event.key.toLowerCase() === 'n' && notesPanel) {
      notesPanel.classList.toggle('visible');
    }
  });

  document.addEventListener('click', function (event) {
    if (notesPanel && notesPanel.contains(event.target)) {
      return;
    }
    go(1);
  });

  render();
})();
`;
