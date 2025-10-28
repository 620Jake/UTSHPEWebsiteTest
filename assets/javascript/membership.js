// assets/javascript/membership.js
(() => {
  "use strict";

  function initSlideshow(root) {
    const imgs = Array.from(root.querySelectorAll("img"));
    if (imgs.length <= 1) return; // nothing to slide

    // Start with the first image active if none is marked
    let index = imgs.findIndex((img) => img.classList.contains("active"));
    if (index === -1) {
      index = 0;
      imgs[0].classList.add("active");
    }

    const delay = Number(root.dataset.delay) || 3500; // ms between slides
    let timer = null;

    function go(to) {
      imgs[index].classList.remove("active");
      index = (to + imgs.length) % imgs.length;
      imgs[index].classList.add("active");
    }
    function next() { go(index + 1); }
    function prev() { go(index - 1); }

    function start() {
      if (timer) return;
      timer = setInterval(next, delay);
    }
    function stop() {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    }

    // Pause on hover (desktop)
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);

    // Pause when tab is hidden; resume when visible
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });

    // Keyboard support when focused
    root.tabIndex = 0; // make focusable
    root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { stop(); next(); }
      if (e.key === "ArrowLeft")  { stop(); prev(); }
    });

    start();
  }

  window.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".slideshow-js").forEach(initSlideshow);
  });
})();

