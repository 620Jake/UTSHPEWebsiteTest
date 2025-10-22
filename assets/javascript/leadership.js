// Simple fade slider
document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.sponsor-slider');
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll('img'));
  let idx = 0;
  const show = i => {
    slides.forEach((img, k) => img.classList.toggle('is-active', k === i));
  };
  show(idx);

  // Auto-rotate
  setInterval(() => {
    idx = (idx + 1) % slides.length;
    show(idx);
  }, 4000);

  // Pause on hover (nice UX)
  let timerPaused = false;
  slider.addEventListener('mouseenter', () => { timerPaused = true; });
  slider.addEventListener('mouseleave', () => { timerPaused = false; });

  // Respect pause flag
  setInterval(() => {
    if (timerPaused) return;
  }, 50);
});

