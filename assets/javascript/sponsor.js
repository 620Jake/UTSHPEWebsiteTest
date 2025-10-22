// Cross-fade slideshow: no timers needed—CSS handles animation.
// JS only sets per-image index and total count.
document.addEventListener('DOMContentLoaded', () => {
  const show = document.querySelector('.sponsor-slideshow');
  if (!show) return;

  const slides = Array.from(show.querySelectorAll('img'));
  if (!slides.length) return;

  // Let CSS know how many slides there are
  show.style.setProperty('--count', slides.length);

  // Stagger each image by index
  slides.forEach((img, i) => {
    img.style.setProperty('--i', i);
    // optional: ensure images don’t flash before CSS applies
    img.decoding = 'async';
    img.loading = 'lazy';
    img.alt ||= 'Sponsor event photo';
  });
});

